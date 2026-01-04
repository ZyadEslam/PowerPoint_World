import { NextRequest, NextResponse } from "next/server";
import Order from "@/app/models/order";
import dbConnect from "@/lib/mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await dbConnect();
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = (await Order.findById(orderId)
      .populate("products.product")
      .populate("addressId")
      .populate({
        path: "userId",
        strictPopulate: false, // Allow null userId for guest orders
      })
      .lean()) as {
      _id: { toString: () => string };
      date: Date | string;
      totalPrice: number;
      orderState: string;
      paymentStatus: string;
      paymentMethod: string;
      products: unknown;
      addressId?: unknown;
      address?: {
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
      };
      userId?: unknown;
      trackingNumber?: string;
      estimatedDeliveryDate?: Date | string;
      shippedDate?: Date | string;
      deliveredDate?: Date | string;
      promoCode?: string;
      discountAmount?: number;
      discountPercentage?: number;
      paymobOrderId?: string;
      paymobTransactionId?: string;
    } | null;

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    interface ProductItem {
      product?: {
        toObject?: () => Record<string, unknown>;
        _id?: unknown;
        [key: string]: unknown;
      };
      price?: number;
      quantity?: number;
      color?: string;
      size?: string;
      sku?: string;
      variantId?: { toString: () => string };
      [key: string]: unknown;
    }

    const clientProducts = Array.isArray(order.products)
      ? order.products.map((item: ProductItem) => {
          if (item?.product) {
            const productDoc = item.product;
            const normalizedProduct = productDoc?.toObject
              ? productDoc.toObject()
              : productDoc;
            return {
              ...normalizedProduct,
              _id: normalizedProduct?._id || item.product,
              price: item.price ?? normalizedProduct?.price,
              quantityInCart: item.quantity ?? item.quantityInCart ?? 1,
              selectedColor: item.color || normalizedProduct?.color,
              selectedSize: item.size || normalizedProduct?.size,
              sku: item.sku || normalizedProduct?.sku,
              selectedVariantId: item.variantId?.toString?.(),
            };
          }
          return item;
        })
      : [];

    return NextResponse.json(
      {
        success: true,
        order: {
          _id: order._id,
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          date: order.date,
          totalPrice: order.totalPrice,
          orderState: order.orderState,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          products: clientProducts,
          // Use addressId if available (saved address), otherwise use address (guest order)
          address: order.addressId || order.address,
          trackingNumber: order.trackingNumber,
          estimatedDeliveryDate: order.estimatedDeliveryDate,
          shippedDate: order.shippedDate,
          deliveredDate: order.deliveredDate,
          promoCode: order.promoCode,
          discountAmount: order.discountAmount,
          discountPercentage: order.discountPercentage,
          paymobOrderId: order.paymobOrderId,
          paymobTransactionId: order.paymobTransactionId,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH - Update order (for paymobOrderId, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await dbConnect();
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { paymobOrderId, paymobTransactionId, paymentStatus, orderState } = body;

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (paymobOrderId) order.paymobOrderId = paymobOrderId;
    if (paymobTransactionId) order.paymobTransactionId = paymobTransactionId;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderState) order.orderState = orderState;

    await order.save();

    return NextResponse.json(
      { success: true, message: "Order updated successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}
