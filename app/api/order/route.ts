import { NextRequest, NextResponse } from "next/server";
import Order from "../../models/order";
import dbConnect from "@/lib/mongoose";
import { sseManager } from "@/lib/sse";
import User from "@/app/models/user";
import mongoose from "mongoose";
import Product from "@/app/models/product";
import { requireAuth, verifyOwnership } from "@/lib/security/authMiddleware";
import { checkOrderRateLimit } from "@/lib/security/rateLimiter";
import { orderCreateSchema, safeParseInput } from "@/lib/security/validator";
import { createErrorResponse } from "@/lib/security/errorHandler";
import {
  logSecurityEvent,
  AuditEventType,
  extractRequestInfo,
} from "@/lib/security/auditLogger";

interface IncomingOrderProduct {
  _id?: string;
  productId?: string;
  variantId?: string;
  selectedVariantId?: string;
  size?: string;
  selectedSize?: string;
  color?: string;
  selectedColor?: string;
  quantityInCart?: number;
  quantity?: number;
  price?: number;
  variantSku?: string;
  sku?: string;
}

const normalizeOrderItems = (
  items: unknown[]
): {
  product: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  size?: string;
  color?: string;
  sku?: string;
  quantity: number;
  price: number;
}[] => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item) return null;

      if (typeof item === "string" && mongoose.Types.ObjectId.isValid(item)) {
        return {
          product: new mongoose.Types.ObjectId(item),
          quantity: 1,
          price: 0,
        };
      }

      if (typeof item !== "object") {
        return null;
      }

      const {
        _id,
        productId,
        variantId,
        selectedVariantId,
        size,
        selectedSize,
        color,
        selectedColor,
        quantityInCart,
        quantity,
        price,
        variantSku,
        sku,
      } = item as IncomingOrderProduct;

      const resolvedProductId = productId || _id;

      if (
        !resolvedProductId ||
        !mongoose.Types.ObjectId.isValid(resolvedProductId)
      ) {
        return null;
      }

      const variantIdValue = variantId || selectedVariantId;
      const resolvedVariantId =
        variantIdValue && mongoose.Types.ObjectId.isValid(variantIdValue)
          ? new mongoose.Types.ObjectId(variantIdValue)
          : undefined;

      const resolvedQuantity = Number(quantityInCart ?? quantity ?? 1);

      return {
        product: new mongoose.Types.ObjectId(resolvedProductId),
        ...(resolvedVariantId && { variantId: resolvedVariantId }),
        ...((size || selectedSize) && { size: size || selectedSize }),
        ...((color || selectedColor) && { color: color || selectedColor }),
        ...(variantSku && { sku: variantSku }),
        ...(!variantSku && sku && { sku }),
        quantity: resolvedQuantity > 0 ? resolvedQuantity : 1,
        price: Number(price) || 0,
      };
    })
    .filter(Boolean) as {
    product: mongoose.Types.ObjectId;
    variantId?: mongoose.Types.ObjectId;
    size?: string;
    color?: string;
    sku?: string;
    quantity: number;
    price: number;
  }[];
};

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication is optional (allow guest orders)
    const session = await requireAuth();

    // 2. Rate limiting (use IP for guests, userId for authenticated users)
    const sessionUserId = session?.user?.id;
    const rateLimitResult = await checkOrderRateLimit(req, sessionUserId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too Many Requests",
          message: "Order rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // 3. Parse and validate input
    const body = await req.json();

    // Pre-process products to normalize cart item structure before validation
    // Cart items might have quantityInCart instead of quantity, and price might be missing
    const processedBody = {
      ...body,
      products: Array.isArray(body.products)
        ? body.products.map((item: unknown) => {
            if (typeof item !== "object" || item === null) return item;
            const product = item as Record<string, unknown>;
            // Ensure quantity field exists (use quantityInCart if quantity is missing)
            if (
              product.quantity === undefined &&
              product.quantityInCart !== undefined
            ) {
              product.quantity = product.quantityInCart;
            }
            // Ensure price field exists (default to 0 if missing, will be fetched from product during normalization)
            if (product.price === undefined || product.price === null) {
              product.price = 0;
            }
            // Ensure productId exists if _id is present (for validation)
            if (product.productId === undefined && product._id !== undefined) {
              product.productId = product._id;
            }
            return product;
          })
        : body.products,
    };

    const validation = safeParseInput(orderCreateSchema, processedBody);

    if (!validation.success) {

      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          message: "Invalid order data",
          details: validation.errors.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
            code: e.code,
          })),
        },
        { status: 400 }
      );
    }

    const {
      userId: orderUserId,
      addressId,
      address,
      products,
      totalPrice,
      promoCode,
      discountAmount,
      discountPercentage,
      paymentMethod,
      paymobOrderId,
      paymobTransactionId,
      shippingFee,
    } = validation.data;

    // 4. Verify user owns the order (only if authenticated)
    // For guest orders, orderUserId will be undefined/null, which is allowed
    if (session && orderUserId) {
      // If user is authenticated and provided userId, verify ownership
      if (
        !verifyOwnership(session.user.id, orderUserId, session.user.isAdmin)
      ) {
        const { ipAddress, userAgent } = extractRequestInfo(req);
        await logSecurityEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
          userId: session.user.id,
          userEmail: session.user.email,
          ipAddress,
          userAgent,
          resource: "/api/order",
          action: "POST",
          result: "blocked",
          details: { attemptedUserId: orderUserId },
        });

        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: "Access denied",
          },
          { status: 403 }
        );
      }
    }

    // Use session userId if authenticated, otherwise use orderUserId (which may be undefined for guests)
    const finalUserId = session?.user?.id || orderUserId || null;

    await dbConnect();

    // Normalize products - this handles various field name variations
    const normalizedProducts = normalizeOrderItems(products);

    if (!normalizedProducts.length) {
      return NextResponse.json(
        { success: false, message: "Order must include valid products" },
        { status: 400 }
      );
    }

    const dbSession = await mongoose.startSession();
    let newOrder;
    try {
      dbSession.startTransaction();

      for (const item of normalizedProducts) {
        // First, verify product exists and identify the variant
        const productDoc = await Product.findById(item.product)
          .select("name variants")
          .session(dbSession);

        if (!productDoc) {
          throw new Error("One of the products in the order no longer exists.");
        }

        if (productDoc.variants?.length) {
          // Identify the variant - either by ID or by size/color combination
          let targetVariantId: mongoose.Types.ObjectId | null = null;
          let variantInfo = "";

          if (item.variantId && mongoose.Types.ObjectId.isValid(item.variantId)) {
            const variant = productDoc.variants.id(item.variantId);
            if (variant) {
              targetVariantId = variant._id as mongoose.Types.ObjectId;
              variantInfo = `${variant.color || ""} ${variant.size || ""}`.trim();
            }
          } else if (item.size || item.color) {
            const variant = productDoc.variants.find(
              (v: { size?: string; color?: string }) => {
                const sizeMatch = item.size ? v.size === item.size : true;
                const colorMatch = item.color ? v.color === item.color : true;
                return sizeMatch && colorMatch;
              }
            );
            if (variant) {
              targetVariantId = variant._id as mongoose.Types.ObjectId;
              variantInfo = `${variant.color || ""} ${variant.size || ""}`.trim();
            }
          }

          if (!targetVariantId) {
            throw new Error(
              `Missing or invalid variant selection for product "${productDoc.name}". Please ensure you've selected a valid size and color combination.`
            );
          }

          // Use atomic operation to check stock and decrement in one step
          // This prevents race conditions when multiple users try to buy the same product
          // The filter ensures the variant has sufficient stock BEFORE decrementing
          const updateResult = await Product.findOneAndUpdate(
            {
              _id: item.product,
              // Use $elemMatch to ensure the specific variant has sufficient quantity
              variants: {
                $elemMatch: {
                  _id: targetVariantId,
                  quantity: { $gte: item.quantity },
                },
              },
            },
            {
              // Atomically decrement the variant quantity using arrayFilters
              $inc: {
                "variants.$[variant].quantity": -item.quantity,
              },
            },
            {
              session: dbSession,
              arrayFilters: [
                {
                  "variant._id": targetVariantId,
                },
              ],
              new: false, // Return the original document before update
            }
          );

          if (!updateResult) {
            // Fetch product again to get current stock for error message
            const currentProduct = await Product.findById(item.product)
              .select("name variants")
              .session(dbSession);

            if (!currentProduct) {
              throw new Error(
                `Product "${productDoc.name}" no longer exists.`
              );
            }

            const variant = currentProduct.variants.id(targetVariantId);
            if (variant) {
              throw new Error(
                `Insufficient stock for ${currentProduct.name}${variantInfo ? ` (${variantInfo})` : ""}. Available: ${variant.quantity}, Requested: ${item.quantity}`
              );
            } else {
              throw new Error(
                `Variant no longer exists for product "${currentProduct.name}".`
              );
            }
          }

          // Update the item with the variantId for consistency
          item.variantId = targetVariantId;
        } else {
          // If no variants exist, we currently allow the order without stock checks.
          // NOTE: To add stock management for products without variants, you would need to:
          // 1. Add a 'stock' field to the product schema (not just the virtual totalStock)
          // 2. Use an atomic findOneAndUpdate similar to the variant logic above
          // 3. Ensure the filter checks stock >= requested quantity before decrementing
        }
      }

      newOrder = new Order({
        ...(finalUserId && { userId: finalUserId }),
        ...(addressId && { addressId }),
        ...(address && { address }),
        products: normalizedProducts,
        totalPrice: +totalPrice,
        date: new Date().toISOString(),
        orderState: "Pending",
        paymentMethod: paymentMethod || "cash_on_delivery",
        paymentStatus:
          paymentMethod === "paymob" && paymobTransactionId
            ? "paid"
            : "pending",
        ...(promoCode && { promoCode }),
        ...(discountAmount !== undefined && {
          discountAmount: +discountAmount,
        }),
        ...(discountPercentage !== undefined && {
          discountPercentage: +discountPercentage,
        }),
        ...(paymobOrderId && { paymobOrderId }),
        ...(paymobTransactionId && { paymobTransactionId }),
        ...(shippingFee !== undefined && { shippingFee: +shippingFee }),
      });
      await newOrder.save({ session: dbSession });

      await dbSession.commitTransaction();
    } catch (err) {
      await dbSession.abortTransaction();
      throw err;
    } finally {
      dbSession.endSession();
    }

    // Get user info for broadcast (if authenticated)
    interface UserDoc {
      _id?: { toString: () => string };
      name?: string;
      email?: string;
      [key: string]: unknown;
    }

    const user = finalUserId
      ? ((await User.findById(finalUserId)
          .select("name email")
          .lean()) as unknown as UserDoc | null)
      : null;

    // Broadcast new order via SSE to all connected admin clients
    // For guest orders, use address info; for authenticated users, use user info
    const isGuestOrder = !session;
    const broadcastUserName = isGuestOrder
      ? address?.name || "Guest"
      : user?.name || "Unknown";
    const broadcastUserEmail = isGuestOrder
      ? address?.phone
        ? `Phone: ${address.phone}`
        : "Guest Order"
      : user?.email || "Unknown";

    sseManager.broadcast("new-order", {
      orderId: newOrder._id.toString(),
      orderNumber: newOrder._id.toString().slice(-8).toUpperCase(),
      userId: user?._id?.toString() || null,
      userName: broadcastUserName,
      userEmail: broadcastUserEmail,
      totalPrice: newOrder.totalPrice,
      orderState: newOrder.orderState,
      paymentStatus: newOrder.paymentStatus,
      createdAt: newOrder.date,
    });

    // Log order creation
    const { ipAddress, userAgent } = extractRequestInfo(req);
    await logSecurityEvent(AuditEventType.ORDER_CREATED, {
      userId: session?.user?.id || "guest",
      userEmail: session?.user?.email || address?.name || "guest",
      ipAddress,
      userAgent,
      resource: "/api/order",
      action: "POST",
      result: "success",
      details: {
        orderId: newOrder._id.toString(),
        totalPrice: newOrder.totalPrice,
        paymentMethod: newOrder.paymentMethod,
        isGuestOrder: !session,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        orderId: newOrder._id,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    return createErrorResponse(error, "Failed to place order");
  }
}
