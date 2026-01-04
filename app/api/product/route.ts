import { NextRequest, NextResponse } from "next/server";
import Product from "@/app/models/product";
import Category from "@/app/models/category";
import connectDB from "@/app/utils/db";
import { sanitizeVariants } from "@/app/utils/variantUtils";
import {
  getCachedData,
  setCachedData,
  invalidateProductCaches,
  getProductListCacheKey,
  CACHE_TTL,
} from "@/lib/cache";
import { requireAdminAccess } from "@/lib/security/authMiddleware";
import { checkProductCreationRateLimit } from "@/lib/security/rateLimiter";
import { productCreateSchema, safeParseInput } from "@/lib/security/validator";
import { createErrorResponse } from "@/lib/security/errorHandler";
import { logAdminAction } from "@/lib/security/auditLogger";
import { sanitizeObject } from "@/lib/security/sanitizer";

const POST = async (req: NextRequest) => {
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
    const rateLimitResult = await checkProductCreationRateLimit(
      req,
      adminSession.user.id
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          message: "Rate limit exceeded",
          success: false,
          error: "Too many product creation requests",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // 3. Parse and validate input
    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);
    const validation = safeParseInput(productCreateSchema, sanitizedBody);

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
    const productData = validation.data;

    if (productData.variants) {
      productData.variants = sanitizeVariants(productData.variants);
    }

    // Convert base64 image strings back to Buffer objects for storage
    const imageBuffers: Buffer[] = [];
    if (productData.imgSrc && Array.isArray(productData.imgSrc)) {
      for (const img of productData.imgSrc) {
        if (typeof img === "string" && img.length > 0) {
          try {
            const buffer = Buffer.from(img, "base64");
            imageBuffers.push(buffer);
          } catch {
            // Skip invalid images
          }
        }
      }
    }

    // Validate that at least one image is provided
    if (imageBuffers.length === 0) {
      return NextResponse.json(
        {
          message: "Validation failed",
          success: false,
          error: "At least one product image is required",
        },
        { status: 400 }
      );
    }

    // Assign converted buffers to productData
    // Cast through unknown first to allow type conversion
    (productData as unknown as { imgSrc: Buffer[] }).imgSrc = imageBuffers;

    // If category is provided but categoryName is not, fetch it from the category
    if (productData.category && !productData.categoryName) {
      const category = await Category.findById(productData.category);
      if (category) {
        productData.categoryName = category.name;
      }
    }

    // Set default hideFromHome if not provided
    if (
      productData.hideFromHome === undefined ||
      productData.hideFromHome === null
    ) {
      productData.hideFromHome = false;
    }

    const product = await Product.create(productData);

    // Invalidate product list cache
    await invalidateProductCaches();

    // Log admin action
    await logAdminAction(
      adminSession.user.id,
      adminSession.user.email || "",
      "create_product",
      `/api/product`,
      req,
      { productId: product._id.toString(), productName: product.name }
    );

    return NextResponse.json(
      { message: "Product created successfully", product, success: true },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return createErrorResponse(error, "Failed to create product");
  }
};

const GET = async () => {
  try {
    // Check cache first
    const cacheKey = getProductListCacheKey();
    const cachedData = await getCachedData<{
      products: unknown[];
      success: boolean;
    }>(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache": "HIT",
        },
      });
    }

    // Cache miss - fetch from database
    await connectDB();
    
    // OPTIMIZED: Use aggregation to get image count without loading full buffer data
    // This is a MAJOR performance improvement - avoids loading MB of image data into memory
    const products = await Product.aggregate([
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          oldPrice: 1,
          discount: 1,
          rating: 1,
          brand: 1,
          category: 1,
          categoryName: 1,
          hideFromHome: 1,
          variants: 1,
          createdAt: 1,
          updatedAt: 1,
          // Get image count without loading actual buffer data
          imageCount: { $size: { $ifNull: ["$imgSrc", []] } },
        },
      },
    ]);

    // Convert to plain objects with proper formatting
    const productsFormatted = products.map((product) => {
      const productObj = { 
        ...product,
        _id: product._id.toString(),
        // Ensure hideFromHome is set (default to false)
        hideFromHome: product.hideFromHome ?? false,
      };

      // Convert variant _id fields to strings
      if (Array.isArray(productObj.variants)) {
        productObj.variants = productObj.variants.map(
          (variant: { _id?: { toString: () => string } | string; [key: string]: unknown }) => ({
            ...variant,
            _id: variant._id
              ? typeof variant._id === "string"
                ? variant._id
                : variant._id.toString()
              : undefined,
          })
        );
      }
      
      // Calculate totalStock from variants
      productObj.totalStock = productObj.variants?.reduce(
        (sum: number, v: { quantity?: number }) => sum + (v?.quantity || 0),
        0
      ) || 0;
      
      return productObj;
    });

    const responseData = {
      products: productsFormatted,
      success: true,
    };

    // Cache the result
    await setCachedData(cacheKey, responseData, CACHE_TTL.PRODUCT_LIST);

    // Add caching headers for better performance
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error, success: false },
      { status: 500 }
    );
  }
};

export { POST, GET };
