import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/app/models/purchase";
import Template from "@/app/models/template";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user's purchases
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const status = searchParams.get("status") || "paid";
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status === "paid") {
      query.paymentStatus = "paid";
      query.status = "active";
    } else if (status === "all") {
      // Show all purchases
    } else {
      query.paymentStatus = status;
    }

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate("templateId", "name slug thumbnail categoryName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Purchase.countDocuments(query),
    ]);

    return NextResponse.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

// POST - Create a new purchase (initiate payment)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { templateId, promoCode } = await req.json();

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Check if template exists
    const template = await Template.findById(templateId);
    if (!template || !template.isActive) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if user already owns this template
    const existingPurchase = await Purchase.findOne({
      userId: session.user.id,
      templateId,
      paymentStatus: "paid",
      status: "active",
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "You already own this template" },
        { status: 400 }
      );
    }

    // Calculate price (can add promo code logic here)
    const purchasePrice = template.price;
    const discountAmount = 0;

    // TODO: Add promo code validation if needed
    if (promoCode) {
      // Promo code logic here
    }

    // Create purchase record
    const purchase = new Purchase({
      userId: session.user.id,
      templateId: template._id,
      templateSnapshot: {
        name: template.name,
        thumbnail: template.thumbnail,
        fileUrl: template.fileUrl,
        fileName: template.fileName,
        categoryName: template.categoryName,
      },
      purchasePrice,
      originalPrice: template.oldPrice || template.price,
      discountAmount,
      promoCode: promoCode || undefined,
      paymentStatus: "pending",
    });

    await purchase.save();

    return NextResponse.json({
      message: "Purchase initiated",
      purchase: {
        id: purchase._id,
        receiptNumber: purchase.receiptNumber,
        amount: purchasePrice,
        templateName: template.name,
      },
    });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}

