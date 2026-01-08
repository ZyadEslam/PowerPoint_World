import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Template from "@/app/models/template";
import Purchase from "@/app/models/purchase";
import User from "@/app/models/user";
import { checkAdminAccess } from "@/lib/adminAuth";

interface PurchaseDocument {
  _id: { toString(): string };
  templateId?: { name?: string; thumbnail?: string };
  templateSnapshot?: { name?: string };
  userId?: { name?: string; email?: string };
  purchasePrice: number;
  createdAt: Date;
  lastDownloadAt?: Date;
  downloadCount?: number;
}

export async function GET() {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get template counts
    const totalTemplates = await Template.countDocuments({ isActive: true });
    const freeTemplates = await Template.countDocuments({
      isActive: true,
      isFree: true,
    });
    const premiumTemplates = await Template.countDocuments({
      isActive: true,
      isFree: { $ne: true },
      price: { $gt: 0 },
    });

    // Get download count (total purchase count across all templates)
    const downloadStats = await Template.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalDownloads: { $sum: "$purchaseCount" } } },
    ]);
    const totalDownloads = downloadStats[0]?.totalDownloads || 0;

    // Get payment stats
    const paymentStats = await Purchase.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalRevenue: { $sum: "$purchasePrice" },
        },
      },
    ]);
    const totalPayments = paymentStats[0]?.totalPayments || 0;
    const totalRevenue = paymentStats[0]?.totalRevenue || 0;

    // Get user stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      purchasedTemplates: { $exists: true, $ne: [] },
    });

    // Get recent purchases with populated data
    const recentPurchases = await Purchase.find({ paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .populate("templateId", "name thumbnail")
      .lean() as unknown as PurchaseDocument[];

    const formattedPurchases = recentPurchases.map((p) => ({
      _id: p._id.toString(),
      templateName:
        p.templateSnapshot?.name || p.templateId?.name || "Unknown",
      userName: p.userId?.name || "Unknown User",
      amount: p.purchasePrice,
      createdAt: p.createdAt,
    }));

    // Get recent downloads (from purchases with downloads)
    const recentDownloads = await Purchase.find({
      paymentStatus: "paid",
      downloadCount: { $gt: 0 },
    })
      .sort({ lastDownloadAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .lean() as unknown as PurchaseDocument[];

    const formattedDownloads = recentDownloads.map((d) => ({
      _id: d._id.toString(),
      templateName: d.templateSnapshot?.name || "Unknown",
      userName: d.userId?.name || "Unknown User",
      createdAt: d.lastDownloadAt || d.createdAt,
    }));

    return NextResponse.json({
      totalTemplates,
      freeTemplates,
      premiumTemplates,
      totalDownloads,
      totalPayments,
      totalRevenue,
      totalUsers,
      activeUsers,
      recentPurchases: formattedPurchases,
      recentDownloads: formattedDownloads,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
