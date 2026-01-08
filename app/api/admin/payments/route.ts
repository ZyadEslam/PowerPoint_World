import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/app/models/purchase";
import { checkAdminAccess } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};

    if (status && status !== "all") {
      query.paymentStatus = status;
    }

    if (search) {
      query.$or = [
        { receiptNumber: { $regex: search, $options: "i" } },
        { "templateSnapshot.name": { $regex: search, $options: "i" } },
      ];
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      Purchase.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("templateId", "name thumbnail")
        .lean(),
      Purchase.countDocuments(query),
    ]);

    // Calculate stats
    const statsAggregation = await Purchase.aggregate([
      {
        $facet: {
          totalRevenue: [
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$purchasePrice" } } },
          ],
          totalTransactions: [{ $count: "count" }],
          successfulPayments: [
            { $match: { paymentStatus: "paid" } },
            { $count: "count" },
          ],
          pendingPayments: [
            { $match: { paymentStatus: "pending" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const stats = {
      totalRevenue: statsAggregation[0]?.totalRevenue[0]?.total || 0,
      totalTransactions: statsAggregation[0]?.totalTransactions[0]?.count || 0,
      successfulPayments: statsAggregation[0]?.successfulPayments[0]?.count || 0,
      pendingPayments: statsAggregation[0]?.pendingPayments[0]?.count || 0,
      averageOrderValue:
        statsAggregation[0]?.successfulPayments[0]?.count > 0
          ? (statsAggregation[0]?.totalRevenue[0]?.total || 0) /
            statsAggregation[0]?.successfulPayments[0]?.count
          : 0,
    };

    return NextResponse.json({
      payments,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
