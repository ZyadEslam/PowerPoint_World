import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import HeroSection from "@/app/models/heroSection";
import { requireAdmin } from "@/lib/adminAuth";

// Default values from translation files
const defaultValues = {
  en: {
    heroBadge: "offer section",
    largestSale: "The largest sale of the year is here!",
    useCode: "Use code:",
    forDiscount: "for 25% OFF",
    promoCode: "BFRIDAY",
  },
  ar: {
    heroBadge: "قسم العروض",
    largestSale: "أكبر تخفيض في السنة هنا!",
    useCode: "استخدم الكود:",
    forDiscount: "للحصول على خصم 25%",
    promoCode: "BFRIDAY",
  },
};

// GET: Fetch hero section content
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const locale = (searchParams.get("locale") || "en") as "en" | "ar";

    // Validate locale
    if (locale !== "en" && locale !== "ar") {
      return NextResponse.json(
        { error: "Invalid locale. Must be 'en' or 'ar'" },
        { status: 400 }
      );
    }

    // Try to fetch from database
    const heroSection = await HeroSection.findOne({ locale, isActive: true });

    if (heroSection) {
      return NextResponse.json(
        {
          success: true,
          data: {
            heroBadge: heroSection.heroBadge,
            largestSale: heroSection.largestSale,
            useCode: heroSection.useCode,
            forDiscount: heroSection.forDiscount,
            promoCode: heroSection.promoCode,
            locale: heroSection.locale,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, s-maxage=300, stale-while-revalidate=600, max-age=60",
            Vary: "Accept-Encoding, Accept-Language",
          },
        }
      );
    }

    // Return default values if not found in database
    return NextResponse.json(
      {
        success: true,
        data: {
          ...defaultValues[locale],
          locale,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600, max-age=60",
          Vary: "Accept-Encoding, Accept-Language",
        },
      }
    );
  } catch {
    const { searchParams } = new URL(req.url);
    const locale = (searchParams.get("locale") || "en") as "en" | "ar";

    // Fallback to default values on error
    return NextResponse.json(
      {
        success: true,
        data: {
          ...defaultValues[locale],
          locale,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600, max-age=60",
          Vary: "Accept-Encoding, Accept-Language",
        },
      }
    );
  }
}

// PUT: Update hero section content (admin only)
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
    const { heroBadge, largestSale, useCode, forDiscount, promoCode, locale } =
      body;

    // Validate locale
    if (!locale || (locale !== "en" && locale !== "ar")) {
      return NextResponse.json(
        { error: "Valid locale ('en' or 'ar') is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!heroBadge || !largestSale || !useCode || !forDiscount || !promoCode) {
      return NextResponse.json(
        {
          error:
            "All fields are required: heroBadge, largestSale, useCode, forDiscount, promoCode",
        },
        { status: 400 }
      );
    }

    // Upsert operation (create if doesn't exist, update if exists)
    const heroSection = await HeroSection.findOneAndUpdate(
      { locale },
      {
        heroBadge: heroBadge.trim(),
        largestSale: largestSale.trim(),
        useCode: useCode.trim(),
        forDiscount: forDiscount.trim(),
        promoCode: promoCode.trim().toUpperCase(),
        locale,
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Hero section updated successfully",
        data: {
          heroBadge: heroSection.heroBadge,
          largestSale: heroSection.largestSale,
          useCode: heroSection.useCode,
          forDiscount: heroSection.forDiscount,
          promoCode: heroSection.promoCode,
          locale: heroSection.locale,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update hero section" },
      { status: 500 }
    );
  }
}

// PATCH: Update hero section content (admin only) - same as PUT
export async function PATCH(req: NextRequest) {
  return PUT(req);
}
