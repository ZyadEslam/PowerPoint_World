import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Template from "@/app/models/template";
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
    const period = searchParams.get("period");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Calculate date filters
    const now = new Date();
    let dateFilter: Record<string, unknown> = {};

    if (period === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { lastDownloadAt: { $gte: startOfDay } };
    } else if (period === "week") {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { lastDownloadAt: { $gte: startOfWeek } };
    } else if (period === "month") {
      const startOfMonth = new Date(now.setDate(now.getDate() - 30));
      dateFilter = { lastDownloadAt: { $gte: startOfMonth } };
    }

    // Get free template downloads from purchases
    const query: Record<string, unknown> = {
      purchasePrice: 0,
      downloadCount: { $gt: 0 },
      ...dateFilter,
    };

    if (search) {
      query["templateSnapshot.name"] = { $regex: search, $options: "i" };
    }

    // Get downloads with pagination
    const [downloads, total] = await Promise.all([
      Purchase.find(query)
        .sort({ lastDownloadAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("templateId", "name thumbnail slug")
        .lean(),
      Purchase.countDocuments(query),
    ]);

    // Calculate stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);

    const [totalDownloads, todayDownloads, weekDownloads, monthDownloads] = await Promise.all([
      Template.aggregate([
        { $match: { isFree: true } },
        { $group: { _id: null, total: { $sum: "$purchaseCount" } } },
      ]),
      Purchase.countDocuments({
        purchasePrice: 0,
        lastDownloadAt: { $gte: todayStart },
      }),
      Purchase.countDocuments({
        purchasePrice: 0,
        lastDownloadAt: { $gte: weekStart },
      }),
      Purchase.countDocuments({
        purchasePrice: 0,
        lastDownloadAt: { $gte: monthStart },
      }),
    ]);

    // Get top downloaded templates
    const topTemplates = await Template.find({ isFree: true })
      .sort({ purchaseCount: -1 })
      .limit(5)
      .select("name purchaseCount")
      .lean();

    const stats = {
      totalDownloads: totalDownloads[0]?.total || 0,
      todayDownloads,
      weekDownloads,
      monthDownloads,
      topTemplates: topTemplates.map((t) => ({
        _id: t._id,
        name: t.name,
        downloads: t.purchaseCount,
      })),
    };

    // Format downloads
    const formattedDownloads = downloads.map((d) => ({
      _id: d._id,
      templateId: d.templateId || {
        name: d.templateSnapshot?.name,
        thumbnail: d.templateSnapshot?.thumbnail,
      },
      userId: d.userId,
      createdAt: d.lastDownloadAt || d.createdAt,
    }));

    return NextResponse.json({
      downloads: formattedDownloads,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Downloads fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch downloads" },
      { status: 500 }
    );
  }
}
