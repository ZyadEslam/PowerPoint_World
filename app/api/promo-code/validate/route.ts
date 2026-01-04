import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import PromoCode from "@/app/models/promoCode";
import { PromoCodeState } from "@/app/types/types";

// POST: Validate a promo code (public endpoint for users)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update expired codes before validation
    await PromoCode.updateExpiredCodes();

    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!promoCode) {
      return NextResponse.json(
        {
          valid: false,
          error: "Promo code not found",
        },
        { status: 404 }
      );
    }

    // Check if code is active
    if (promoCode.state !== PromoCodeState.ACTIVE) {
      return NextResponse.json(
        {
          valid: false,
          error:
            promoCode.state === PromoCodeState.EXPIRED
              ? "Promo code has expired"
              : "Promo code is not active",
        },
        { status: 400 }
      );
    }

    // Check date validity
    const now = new Date();
    if (promoCode.startDate > now) {
      return NextResponse.json(
        {
          valid: false,
          error: "Promo code is not yet active",
        },
        { status: 400 }
      );
    }

    if (promoCode.endDate < now) {
      // Update to expired if not already
      promoCode.state = PromoCodeState.EXPIRED;
      await promoCode.save();
      return NextResponse.json(
        {
          valid: false,
          error: "Promo code has expired",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        discountPercentage: promoCode.discountPercentage,
        promoCode: {
          code: promoCode.code,
          discountPercentage: promoCode.discountPercentage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}

