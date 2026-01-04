import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Settings from "@/app/models/settings";
import { requireAdmin } from "@/lib/adminAuth";

// GET: Fetch current shipping fees (public endpoint)
export async function GET() {
  try {
    await dbConnect();

    // Try to fetch from database
    let settings = await Settings.findOne();

    // If no settings exist, create default one
    if (!settings) {
      settings = await Settings.create({
        shippingFee: 0,
        cairoGizaShippingFee: 0,
        otherCitiesShippingFee: 0,
      });
    }

    return NextResponse.json(
      {
        success: true,
        shippingFee: settings.shippingFee,
        cairoGizaShippingFee: settings.cairoGizaShippingFee ?? 0,
        otherCitiesShippingFee: settings.otherCitiesShippingFee ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return default value on error
    return NextResponse.json(
      {
        success: true,
        shippingFee: 0,
        cairoGizaShippingFee: 0,
        otherCitiesShippingFee: 0,
      },
      { status: 200 }
    );
  }
}

// PUT: Update shipping fees (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { shippingFee, cairoGizaShippingFee, otherCitiesShippingFee } = body;

    // Build update object with only provided fields
    const updateData: Record<string, number> = {};

    // Validate and add shippingFee if provided (legacy field)
    if (shippingFee !== undefined && shippingFee !== null) {
      const feeValue = Number(shippingFee);
      if (isNaN(feeValue) || feeValue < 0) {
        return NextResponse.json(
          { error: "Shipping fee must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.shippingFee = feeValue;
    }

    // Validate and add cairoGizaShippingFee if provided
    if (cairoGizaShippingFee !== undefined && cairoGizaShippingFee !== null) {
      const feeValue = Number(cairoGizaShippingFee);
      if (isNaN(feeValue) || feeValue < 0) {
        return NextResponse.json(
          { error: "Cairo/Giza shipping fee must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.cairoGizaShippingFee = feeValue;
    }

    // Validate and add otherCitiesShippingFee if provided
    if (otherCitiesShippingFee !== undefined && otherCitiesShippingFee !== null) {
      const feeValue = Number(otherCitiesShippingFee);
      if (isNaN(feeValue) || feeValue < 0) {
        return NextResponse.json(
          { error: "Other cities shipping fee must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.otherCitiesShippingFee = feeValue;
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "At least one shipping fee field is required" },
        { status: 400 }
      );
    }

    // Upsert operation (create if doesn't exist, update if exists)
    const settings = await Settings.findOneAndUpdate(
      {},
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Shipping fees updated successfully",
        shippingFee: settings.shippingFee,
        cairoGizaShippingFee: settings.cairoGizaShippingFee ?? 0,
        otherCitiesShippingFee: settings.otherCitiesShippingFee ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating shipping fees:", error);
    return NextResponse.json(
      { error: "Failed to update shipping fees" },
      { status: 500 }
    );
  }
}
