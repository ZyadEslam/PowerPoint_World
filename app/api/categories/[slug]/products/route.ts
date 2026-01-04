import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/db";
import Product from "@/app/models/product";
import Category from "@/app/models/category";
import {
  getCachedData,
  setCachedData,
  getCategoryProductsCacheKey,
  CACHE_TTL,
} from "@/lib/cache";

interface Params {
  params: Promise<{ slug: string }>;
}

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Get limit from query params, default to 20 for home page display
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    console.log("[slug]/products route hit with slug:", slug);

    if (!slug) {
      console.error("No slug provided");
      return NextResponse.json(
        {
          success: false,
          message: "Category identifier is required",
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCategoryProductsCacheKey(slug, limit);
    const cachedData = await getCachedData<{
      success: boolean;
      data: unknown[];
      count: number;
    }>(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "X-Cache": "HIT",
        },
      });
    }

    // Cache miss - fetch from database
    await connectDB();

    interface CategoryDoc {
      _id: { toString: () => string };
      name: string;
      slug: string;
      [key: string]: unknown;
    }

    let category: CategoryDoc | null = null;

    // Check if slug is an ObjectId (categoryId) or a slug string
    if (isValidObjectId(slug)) {
      // It's an ObjectId, find by ID - use lean() for performance
      category = (await Category.findById(
        slug
      ).lean()) as unknown as CategoryDoc | null;
    } else {
      // It's a slug string, find by slug - use lean() for performance
      category = (await Category.findOne({
        slug,
        isActive: true,
      }).lean()) as unknown as CategoryDoc | null;
    }

    if (!category) {
      console.log("Category not found for identifier:", slug);
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    console.log("Category found:", category.name);

    // Fetch products for this category with limit, excluding hidden products, sorted by createdAt
    // Use lean() for faster queries - returns plain objects instead of Mongoose documents
    const products = await Product.find({
      category: category._id,
      hideFromHome: { $ne: true }, // Exclude products hidden from home
    })
      .select(
        "name description price oldPrice discount rating brand categoryName imgSrc hideFromHome createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    // Type definition for product from lean query
    interface ProductDoc {
      _id: { toString: () => string };
      name: string;
      description: string;
      price: number;
      oldPrice?: number;
      discount?: number;
      rating: number;
      brand: string;
      categoryName: string;
      imgSrc?: unknown[];
      hideFromHome?: boolean;
      createdAt?: Date | string;
      [key: string]: unknown;
    }

    // Convert products to format compatible with ProductCardProps
    const formattedProducts = products.map((product) => {
      const productTyped = product as unknown as ProductDoc;
      return {
        _id: productTyped._id.toString(),
        name: productTyped.name,
        description: productTyped.description,
        price: productTyped.price,
        oldPrice: productTyped.oldPrice,
        discount: productTyped.discount,
        rating: productTyped.rating,
        brand: productTyped.brand,
        categoryName: productTyped.categoryName,
        imgSrc: (productTyped.imgSrc || []).map(
          (_: unknown, index: number) =>
            `/api/product/image/${productTyped._id}?index=${index}`
        ) as unknown as Array<unknown>,
      };
    });

    const responseData = {
      success: true,
      data: formattedProducts,
      count: formattedProducts.length,
    };

    // Cache the result
    await setCachedData(cacheKey, responseData, CACHE_TTL.CATEGORY_PRODUCTS);

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
