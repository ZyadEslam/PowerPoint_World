import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import PromoCode from "@/app/models/promoCode";
import { PromoCodeState } from "@/app/types/types";
import { requireAdmin } from "@/lib/adminAuth";

// GET: Fetch all promo codes (admin only)
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Update expired codes before fetching
    await PromoCode.updateExpiredCodes();

    const promoCodes = await PromoCode.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ promoCodes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

// POST: Create a new promo code (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, discountPercentage, startDate, endDate, state } = body;

    // Validation
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required and must be a string" },
        { status: 400 }
      );
    }

    if (
      !discountPercentage ||
      typeof discountPercentage !== "number" ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      return NextResponse.json(
        { error: "Discount percentage must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const validState = state && Object.values(PromoCodeState).includes(state)
      ? state
      : PromoCodeState.INACTIVE;

    await dbConnect();

    // Check if code already exists
    const existingCode = await PromoCode.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      );
    }

    const promoCode = new PromoCode({
      code: code.toUpperCase().trim(),
      discountPercentage,
      author: session.user.id,
      startDate: start,
      endDate: end,
      state: validState,
    });

    await promoCode.save();
    await promoCode.populate("author", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Promo code created successfully",
        promoCode,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating promo code:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}

// PUT: Update a promo code (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, code, discountPercentage, startDate, endDate, state } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (code !== undefined) {
      const codeUpper = code.toUpperCase().trim();
      // Check if code is being changed and if new code already exists
      if (codeUpper !== promoCode.code) {
        const existingCode = await PromoCode.findOne({ code: codeUpper });
        if (existingCode) {
          return NextResponse.json(
            { error: "Promo code already exists" },
            { status: 400 }
          );
        }
        promoCode.code = codeUpper;
      }
    }

    if (discountPercentage !== undefined) {
      if (
        typeof discountPercentage !== "number" ||
        discountPercentage < 0 ||
        discountPercentage > 100
      ) {
        return NextResponse.json(
          { error: "Discount percentage must be a number between 0 and 100" },
          { status: 400 }
        );
      }
      promoCode.discountPercentage = discountPercentage;
    }

    if (startDate !== undefined) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date format" },
          { status: 400 }
        );
      }
      promoCode.startDate = start;
    }

    if (endDate !== undefined) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date format" },
          { status: 400 }
        );
      }
      promoCode.endDate = end;
    }

    // Validate date range
    if (promoCode.startDate >= promoCode.endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (state !== undefined) {
      if (!Object.values(PromoCodeState).includes(state)) {
        return NextResponse.json(
          { error: "Invalid state value" },
          { status: 400 }
        );
      }
      promoCode.state = state;
    }

    await promoCode.save();
    await promoCode.populate("author", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Promo code updated successfully",
        promoCode,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating promo code:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update promo code" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a promo code (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const promoCode = await PromoCode.findByIdAndDelete(id);

    if (!promoCode) {
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Promo code deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}

