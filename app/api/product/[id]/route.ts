import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/app/models/product";
import Category from "@/app/models/category";
import connectDB from "@/app/utils/db";
import { sanitizeVariants } from "@/app/utils/variantUtils";
import {
  getCachedData,
  setCachedData,
  invalidateProductCaches,
  getProductCacheKey,
  CACHE_TTL,
} from "@/lib/cache";
import { requireAdminAccess } from "@/lib/security/authMiddleware";
import { checkAdminRateLimit } from "@/lib/security/rateLimiter";
import { productUpdateSchema, safeParseInput } from "@/lib/security/validator";
import { createErrorResponse } from "@/lib/security/errorHandler";
import { logAdminAction } from "@/lib/security/auditLogger";
import { sanitizeObject, sanitizeObjectId } from "@/lib/security/sanitizer";

// Define the params type
interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required", success: false },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getProductCacheKey(id);
    const cachedData = await getCachedData<{
      product: unknown;
      success: boolean;
    }>(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "X-Cache": "HIT",
        },
      });
    }

    // Cache miss - connect to database
    try {
      await connectDB();
    } catch (dbError) {
      return NextResponse.json(
        {
          message: "Database connection failed",
          success: false,
          error:
            dbError instanceof Error
              ? dbError.message
              : "Database connection error",
        },
        { status: 500 }
      );
    }

    // OPTIMIZED: Use aggregation to get image count without loading full buffer data
    // This is a MAJOR performance improvement - avoids loading MB of image data
    const result = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          oldPrice: 1,
          discount: 1,
          rating: 1,
          brand: 1,
          categoryName: 1,
          variants: 1,
          hideFromHome: 1,
          createdAt: 1,
          updatedAt: 1,
          // Get image count without loading actual buffer data
          imageCount: { $size: { $ifNull: ["$imgSrc", []] } },
        },
      },
    ]);

    const product = result[0];

    if (!product) {
      return NextResponse.json(
        { message: "Product not found", success: false },
        { status: 404 }
      );
    }

    // Convert to plain object and format image sources
    const productObj = {
      ...product,
      _id: product._id.toString(),
      // Generate API endpoints based on image count (not actual buffer data)
      imgSrc: Array.from(
        { length: product.imageCount || 0 },
        (_, i) => `/api/product/image/${id}?index=${i}`
      ),
      // Convert variant _id fields to strings
      variants: Array.isArray(product.variants)
        ? product.variants.map((variant: { _id?: { toString: () => string } | string; [key: string]: unknown }) => ({
            ...variant,
            _id: variant._id
              ? typeof variant._id === "string"
                ? variant._id
                : variant._id.toString()
              : undefined,
          }))
        : product.variants,
    };
    
    // Remove imageCount from response (internal use only)
    delete (productObj as { imageCount?: number }).imageCount;

    const responseData = {
      product: productObj,
      success: true,
    };

    // Cache the result
    await setCachedData(cacheKey, responseData, CACHE_TTL.PRODUCT_SINGLE);

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Failed to fetch product";

    return NextResponse.json(
      {
        message: errorMessage,
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    // 1. Require admin authentication
    const adminSession = await requireAdminAccess();
    if (!adminSession) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // 2. Rate limiting
    const rateLimitResult = await checkAdminRateLimit(
      request,
      adminSession.user.id
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          message: "Rate limit exceeded",
          success: false,
          error: "Too many requests",
        },
        { status: 429 }
      );
    }

    // 3. Validate and sanitize product ID
    const { id } = await params;
    const sanitizedId = sanitizeObjectId(id);
    if (!sanitizedId) {
      return NextResponse.json(
        { message: "Invalid product ID", success: false },
        { status: 400 }
      );
    }

    // 4. Parse and validate input
    const body = await request.json();
    const sanitizedBody = sanitizeObject(body);
    const validation = safeParseInput(productUpdateSchema, sanitizedBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          success: false,
          error: "Invalid product data",
          details: validation.errors.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    await connectDB();
    const updateData = validation.data;

    if (updateData.variants) {
      updateData.variants = sanitizeVariants(updateData.variants);
    }

    // If category is provided but categoryName is not, fetch it from the category
    if (updateData.category && !updateData.categoryName) {
      const category = await Category.findById(updateData.category);
      if (category) {
        updateData.categoryName = category.name;
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found", success: false },
        { status: 404 }
      );
    }

    // Invalidate caches
    await invalidateProductCaches(id);

    return NextResponse.json(
      { message: "Product updated successfully", product, success: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error, success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // 1. Require admin authentication
    const adminSession = await requireAdminAccess();
    if (!adminSession) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // 2. Rate limiting
    const rateLimitResult = await checkAdminRateLimit(
      request,
      adminSession.user.id
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          message: "Rate limit exceeded",
          success: false,
          error: "Too many requests",
        },
        { status: 429 }
      );
    }

    // 3. Validate and sanitize product ID
    const { id } = await params;
    const sanitizedId = sanitizeObjectId(id);
    if (!sanitizedId) {
      return NextResponse.json(
        { message: "Invalid product ID", success: false },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findById(sanitizedId);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found", success: false },
        { status: 404 }
      );
    }

    // Store product name for logging before deletion
    const productName = product.name;

    await Product.findByIdAndDelete(sanitizedId);

    // Invalidate caches
    await invalidateProductCaches(sanitizedId);

    // Log admin action
    await logAdminAction(
      adminSession.user.id,
      adminSession.user.email || "",
      "delete_product",
      `/api/product/${sanitizedId}`,
      request,
      { productId: sanitizedId, productName }
    );

    return NextResponse.json(
      { message: "Product deleted successfully", success: true },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    return createErrorResponse(error, "Failed to delete product");
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // 1. Require admin authentication
    const adminSession = await requireAdminAccess();
    if (!adminSession) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // 2. Rate limiting
    const rateLimitResult = await checkAdminRateLimit(
      request,
      adminSession.user.id
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          message: "Rate limit exceeded",
          success: false,
          error: "Too many requests",
        },
        { status: 429 }
      );
    }

    // 3. Validate and sanitize product ID
    const { id } = await params;
    const sanitizedId = sanitizeObjectId(id);
    if (!sanitizedId) {
      return NextResponse.json(
        { message: "Invalid product ID", success: false },
        { status: 400 }
      );
    }

    // 4. Parse and validate input
    const body = await request.json();
    const sanitizedBody = sanitizeObject(body);
    const validation = safeParseInput(productUpdateSchema, sanitizedBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          success: false,
          error: "Invalid product data",
          details: validation.errors.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    await connectDB();
    const updateData = validation.data;

    if (updateData.variants) {
      updateData.variants = sanitizeVariants(updateData.variants);
    }

    // If category is provided but categoryName is not, fetch it from the category
    if (updateData.category && !updateData.categoryName) {
      const category = await Category.findById(updateData.category);
      if (category) {
        updateData.categoryName = category.name;
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found", success: false },
        { status: 404 }
      );
    }

    // Invalidate caches
    await invalidateProductCaches(id);

    return NextResponse.json(
      { message: "Product updated successfully", product, success: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error, success: false },
      { status: 500 }
    );
  }
}
