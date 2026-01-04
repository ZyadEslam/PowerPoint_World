import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/app/models/order";
import { requireAdmin } from "@/lib/adminAuth";
import { sseManager } from "@/lib/sse";

interface Params {
  params: Promise<{ orderId: string }>;
}

interface OrderWithPopulated {
  _id: { toString: () => string };
  date: Date | string;
  totalPrice: number;
  orderState: string;
  paymentStatus: string;
  paymentMethod: string;
  userId?: { _id?: { toString: () => string }; name?: string; email?: string };
  addressId?: unknown;
  address?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
  };
  products?: unknown[];
  trackingNumber?: string;
  estimatedDeliveryDate?: Date | string;
  shippedDate?: Date | string;
  deliveredDate?: Date | string;
  promoCode?: string;
  discountAmount?: number;
  discountPercentage?: number;
}

/**
 * GET: Fetch a single order by ID
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { orderId } = await params;

    const order = await Order.findById(orderId)
      .populate({
        path: "userId",
        select: "name email",
      })
      .populate({
        path: "addressId",
        select: "name phone address city state",
      })
      .populate({
        path: "products.product",
        select: "name price images",
      })
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format order response to match expected structure
    // Convert through unknown first to handle Mongoose type mismatch
    const orderTyped = order as unknown as OrderWithPopulated;

    // Format products with order item details (quantity, size, color, sku)
    type OrderItem = {
      product?: {
        _id?: { toString: () => string };
        name?: string;
        price?: number;
        images?: unknown[];
      };
      _id?: { toString: () => string };
      price?: number;
      quantity?: number;
      size?: string;
      color?: string;
      sku?: string;
      variantId?: { toString: () => string };
    };

    const formattedProducts = ((orderTyped.products || []) as OrderItem[]).map(
      (item: OrderItem) => {
        const product = item.product;
        return {
          _id: product?._id?.toString() || item._id?.toString(),
          name: product?.name || "Unknown Product",
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          size: item.size || null,
          color: item.color || null,
          sku: item.sku || null,
          variantId: item.variantId?.toString() || null,
          images: product?.images || [],
        };
      }
    );

    // Check if this is a guest order and format user info accordingly
    const isGuestOrder = !orderTyped.userId;
    const userName = isGuestOrder
      ? orderTyped.address?.name || "Guest"
      : orderTyped.userId?.name || "Unknown";
    const userEmail = isGuestOrder
      ? orderTyped.address?.phone
        ? `Phone: ${orderTyped.address.phone}`
        : "Guest Order"
      : orderTyped.userId?.email || "Unknown";

    const formattedOrder = {
      _id: orderTyped._id.toString(),
      orderNumber: orderTyped._id.toString().slice(-8).toUpperCase(),
      date: orderTyped.date,
      totalPrice: orderTyped.totalPrice,
      orderState: orderTyped.orderState,
      paymentStatus: orderTyped.paymentStatus,
      paymentMethod: orderTyped.paymentMethod,
      userId: orderTyped.userId?._id?.toString() || null,
      userName,
      userEmail,
      address: orderTyped.addressId || orderTyped.address, // Use addressId if available, otherwise use address object for guest orders
      products: formattedProducts,
      trackingNumber: orderTyped.trackingNumber,
      estimatedDeliveryDate: orderTyped.estimatedDeliveryDate,
      shippedDate: orderTyped.shippedDate,
      deliveredDate: orderTyped.deliveredDate,
      promoCode: orderTyped.promoCode,
      discountAmount: orderTyped.discountAmount || 0,
      discountPercentage: orderTyped.discountPercentage,
      isGuestOrder,
    };

    return NextResponse.json(
      {
        order: formattedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update order status and details
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { orderId } = await params;
    const body = await req.json();

    const {
      orderState,
      paymentStatus,
      trackingNumber,
      estimatedDeliveryDate,
      shippedDate,
      deliveredDate,
    } = body;

    // Validate orderState if provided
    const validStates = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (orderState && !validStates.includes(orderState)) {
      return NextResponse.json(
        {
          error: `Invalid order state. Must be one of: ${validStates.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (orderState) updateData.orderState = orderState;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined)
      updateData.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate)
      updateData.estimatedDeliveryDate = new Date(estimatedDeliveryDate);

    // Auto-set dates based on status
    if (orderState === "Shipped" && !shippedDate) {
      updateData.shippedDate = new Date();
    } else if (shippedDate) {
      updateData.shippedDate = new Date(shippedDate);
    }

    if (orderState === "Delivered" && !deliveredDate) {
      updateData.deliveredDate = new Date();
    } else if (deliveredDate) {
      updateData.deliveredDate = new Date(deliveredDate);
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({
        path: "userId",
        select: "name email",
      })
      .populate({
        path: "addressId",
        select: "name phone address city state",
      })
      .populate({
        path: "products.product",
        select: "name price images",
      })
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Broadcast update via SSE
    // Convert through unknown first to handle Mongoose type mismatch
    const orderTyped = order as unknown as OrderWithPopulated;
    sseManager.broadcast("order-updated", {
      orderId: orderTyped._id.toString(),
      orderNumber: orderTyped._id.toString().slice(-8).toUpperCase(),
      orderState: orderTyped.orderState,
      updatedAt: new Date().toISOString(),
    });

    // Format products with order item details (quantity, size, color, sku)
    type OrderItem = {
      product?: {
        _id?: { toString: () => string };
        name?: string;
        price?: number;
        images?: unknown[];
      };
      _id?: { toString: () => string };
      price?: number;
      quantity?: number;
      size?: string;
      color?: string;
      sku?: string;
      variantId?: { toString: () => string };
    };

    const formattedProducts = ((orderTyped.products || []) as OrderItem[]).map(
      (item: OrderItem) => {
        const product = item.product;
        return {
          _id: product?._id?.toString() || item._id?.toString(),
          name: product?.name || "Unknown Product",
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          size: item.size || null,
          color: item.color || null,
          sku: item.sku || null,
          variantId: item.variantId?.toString() || null,
          images: product?.images || [],
        };
      }
    );

    // Format order response to match expected structure
    const formattedOrder = {
      _id: orderTyped._id.toString(),
      orderNumber: orderTyped._id.toString().slice(-8).toUpperCase(),
      date: orderTyped.date,
      totalPrice: orderTyped.totalPrice,
      orderState: orderTyped.orderState,
      paymentStatus: orderTyped.paymentStatus,
      paymentMethod: orderTyped.paymentMethod,
      userId: orderTyped.userId?._id?.toString(),
      userName: orderTyped.userId?.name || "Unknown",
      userEmail: orderTyped.userId?.email || "Unknown",
      address: orderTyped.addressId, // Map addressId to address
      products: formattedProducts,
      trackingNumber: orderTyped.trackingNumber,
      estimatedDeliveryDate: orderTyped.estimatedDeliveryDate,
      shippedDate: orderTyped.shippedDate,
      deliveredDate: orderTyped.deliveredDate,
      promoCode: orderTyped.promoCode,
      discountAmount: orderTyped.discountAmount || 0,
      discountPercentage: orderTyped.discountPercentage,
    };

    return NextResponse.json(
      {
        message: "Order updated successfully",
        order: formattedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete an order
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { orderId } = await params;

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    // Broadcast deletion via SSE
    sseManager.broadcast("order-deleted", {
      orderId: orderId,
      orderNumber: orderId.slice(-8).toUpperCase(),
      deletedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: "Order deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
