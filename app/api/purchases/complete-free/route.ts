import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/app/models/purchase";
import Template from "@/app/models/template";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Complete a free template purchase
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { purchaseId } = await req.json();

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 }
      );
    }

    // Find the pending purchase
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      userId: session.user.id,
      paymentStatus: "pending",
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found or already processed" },
        { status: 404 }
      );
    }

    // Verify the template is free
    const template = await Template.findById(purchase.templateId);
    
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (template.price > 0) {
      return NextResponse.json(
        { error: "This template requires payment" },
        { status: 400 }
      );
    }

    // Mark the purchase as paid (free)
    purchase.paymentStatus = "paid";
    purchase.purchasePrice = 0;
    await purchase.save();

    // Increment purchase count on template
    await Template.findByIdAndUpdate(purchase.templateId, {
      $inc: { purchaseCount: 1 },
    });

    return NextResponse.json({
      success: true,
      message: "Free template successfully added to your library",
      purchase: {
        id: purchase._id,
        receiptNumber: purchase.receiptNumber,
      },
    });
  } catch (error) {
    console.error("Error completing free purchase:", error);
    return NextResponse.json(
      { error: "Failed to complete purchase" },
      { status: 500 }
    );
  }
}
