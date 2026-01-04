import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/app/models/order";
import User from "@/app/models/user";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET: Fetch all orders with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Check admin access
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber");
    const username = searchParams.get("username");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};

    // Filter by order number (last 8 chars of order ID)
    if (orderNumber) {
      // Try to find orders where the last 8 characters match
      const orderIdPattern = new RegExp(orderNumber.slice(-8) + "$", "i");
      query._id = { $regex: orderIdPattern };
    }

    // Filter by status
    if (status && status !== "all") {
      query.orderState = status;
    }

    // Filter by username (user name or email)
    if (username) {
      const users = await User.find({
        $or: [
          { name: { $regex: username, $options: "i" } },
          { email: { $regex: username, $options: "i" } },
        ],
      }).select("_id");

      if (users.length > 0) {
        query.userId = { $in: users.map((u) => u._id) };
      } else {
        // No users found, return empty result
        return NextResponse.json({
          orders: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Fetch orders with populated data
    // Note: userId populate is conditional since guest orders may have null userId
    const orders = await Order.find(query)
      .populate({
        path: "userId",
        select: "name email",
        strictPopulate: false, // Allow null userId for guest orders
      })
      .populate({
        path: "addressId",
        select: "name phone address city state",
      })
      .populate({
        path: "products.product",
        select: "name price imgSrc",
      })
      .sort({ date: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    // Format orders for response
    interface OrderWithPopulated {
      _id: { toString: () => string };
      date: Date | string;
      totalPrice: number;
      orderState: string;
      paymentStatus: string;
      paymentMethod: string;
      userId?: {
        _id?: { toString: () => string };
        name?: string;
        email?: string;
      };
      addressId?: unknown;
      products?: unknown[];
      trackingNumber?: string;
      estimatedDeliveryDate?: Date | string;
      shippedDate?: Date | string;
      deliveredDate?: Date | string;
      promoCode?: string;
      discountAmount?: number;
      discountPercentage?: number;
    }

    const formattedOrders = orders.map((order) => {
      // Convert through unknown first to handle Mongoose type mismatch
      const orderTyped = order as unknown as OrderWithPopulated & {
        address?: {
          name?: string;
          phone?: string;
          address?: string;
          city?: string;
          state?: string;
        };
      };

      // For guest orders, use address from order.address instead of userId
      const isGuestOrder = !orderTyped.userId;
      const userName = isGuestOrder
        ? orderTyped.address?.name || "Guest"
        : orderTyped.userId?.name || "Unknown";
      // For guest orders, use phone number as contact info, otherwise use email
      const userEmail = isGuestOrder
        ? orderTyped.address?.phone
          ? `Phone: ${orderTyped.address.phone}`
          : "Guest Order"
        : orderTyped.userId?.email || "Unknown";

      return {
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
        address: orderTyped.addressId || orderTyped.address,
        products: orderTyped.products || [],
        trackingNumber: orderTyped.trackingNumber,
        estimatedDeliveryDate: orderTyped.estimatedDeliveryDate,
        shippedDate: orderTyped.shippedDate,
        deliveredDate: orderTyped.deliveredDate,
        promoCode: orderTyped.promoCode,
        discountAmount: orderTyped.discountAmount || 0,
        discountPercentage: orderTyped.discountPercentage,
        isGuestOrder,
      };
    });

    return NextResponse.json(
      {
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
