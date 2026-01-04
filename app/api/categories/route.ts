import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/db";
import Category from "@/app/models/category";
import Product from "@/app/models/product";
import {
  getCachedData,
  setCachedData,
  invalidateCategoryCaches,
  getCategoriesCacheKey,
  CACHE_TTL,
} from "@/lib/cache";
import { requireAdminAccess } from "@/lib/security/authMiddleware";
import { checkAdminRateLimit } from "@/lib/security/rateLimiter";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  safeParseInput,
} from "@/lib/security/validator";
import { createErrorResponse } from "@/lib/security/errorHandler";
import { logAdminAction } from "@/lib/security/auditLogger";
import { sanitizeObject } from "@/lib/security/sanitizer";

// GET all categories with their products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const active = searchParams.get("active");
    const limit = searchParams.get("limit");
    const includeProducts = searchParams.get("includeProducts") === "true";

    // Check cache first
    const cacheKey = getCategoriesCacheKey({
      featured,
      active,
      limit,
      includeProducts,
    });
    const cachedData = await getCachedData<{
      success: boolean;
      data: unknown[];
      count: number;
    }>(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600, max-age=60",
          "X-Cache": "HIT",
          Vary: "Accept-Encoding",
        },
      });
    }

    // Cache miss - fetch from database
    await connectDB();

    const query: Record<string, unknown> = {};

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (active === "true") {
      query.isActive = true;
    }

    let categoriesQuery = Category.find(query).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    if (limit) {
      categoriesQuery = categoriesQuery.limit(parseInt(limit));
    }

    if (includeProducts) {
      categoriesQuery = categoriesQuery.populate({
        path: "products",
        model: Product,
        select: "name price oldPrice discount rating imgSrc brand categoryName",
        options: { limit: 8 }, // Limit products per category for performance
      });
    }

    // Use .lean() for faster queries - returns plain objects instead of Mongoose documents
    const categories = await categoriesQuery.lean().exec();

    const responseData = {
      success: true,
      data: categories,
      count: categories.length,
    };

    // Cache the result
    await setCachedData(cacheKey, responseData, CACHE_TTL.CATEGORIES);

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=600, max-age=60",
        "X-Cache": "MISS",
        Vary: "Accept-Encoding",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    // 1. Require admin authentication
    const adminSession = await requireAdminAccess();
    if (!adminSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "Admin access required",
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
          success: false,
          error: "Too Many Requests",
          message: "Rate limit exceeded",
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate input
    const body = await request.json();
    const validation = safeParseInput(categoryCreateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          message: "Invalid category data",
          details: validation.errors.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, description, image, isFeatured, sortOrder, isActive } =
      validation.data;

    await connectDB();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = new Category({
      name,
      slug,
      description,
      image,
      isActive: typeof isActive === "boolean" ? isActive : true,
      isFeatured: isFeatured || false,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      products: [],
    });

    await category.save();

    // Invalidate category caches
    await invalidateCategoryCaches(slug);

    // Log admin action
    await logAdminAction(
      adminSession.user.id,
      adminSession.user.email || "",
      "create_category",
      "/api/categories",
      request,
      { categoryId: category._id.toString(), categoryName: category.name }
    );

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category created successfully",
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json(
        {
          success: false,
          message: "Category with this name already exists",
          error: "Duplicate category",
        },
        { status: 409 }
      );
    }

    return createErrorResponse(error, "Failed to create category");
  }
}

// PATCH update existing category (e.g. active state and priority/sort order)
export async function PATCH(request: NextRequest) {
  try {
    // 1. Require admin authentication
    const adminSession = await requireAdminAccess();
    if (!adminSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "Admin access required",
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
          success: false,
          error: "Too Many Requests",
          message: "Rate limit exceeded",
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate input
    const body = await request.json();
    const { id, ...updateFields } = body;

    // Validate id is provided
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }

    // Validate and sanitize update fields
    const sanitizedBody = sanitizeObject(updateFields);
    const validation = safeParseInput(categoryUpdateSchema, sanitizedBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          message: "Invalid category data",
          details: validation.errors.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { isActive, isFeatured, sortOrder, name, description } =
      validation.data;

    await connectDB();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category id is required",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (typeof isFeatured === "boolean") {
      updateData.isFeatured = isFeatured;
    }

    if (typeof sortOrder === "number") {
      // Ensure non-negative integer priority
      updateData.sortOrder = Math.max(0, Math.floor(sortOrder));
    }

    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (typeof description === "string") {
      updateData.description = description;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields provided to update",
        },
        { status: 400 }
      );
    }

    // Get the category before update to get the slug for cache invalidation
    const existingCategory = await Category.findById(id);
    const categorySlug = existingCategory?.slug;

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    // Invalidate category caches (use old slug if available, or new slug)
    await invalidateCategoryCaches(categorySlug || category.slug);

    // Log admin action
    await logAdminAction(
      adminSession.user.id,
      adminSession.user.email || "",
      "update_category",
      `/api/categories`,
      request,
      { categoryId: category._id.toString(), categoryName: category.name }
    );

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category updated successfully",
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    return createErrorResponse(error, "Failed to update category");
  }
}
