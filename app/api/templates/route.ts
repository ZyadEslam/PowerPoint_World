import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Template from "@/app/models/template";
import Category from "@/app/models/category";

// GET all templates with filtering
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = { isActive: true };

    if (category && category !== "all") {
      // Find category by slug
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort
    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "price-low":
        sortQuery = { price: 1 };
        break;
      case "price-high":
        sortQuery = { price: -1 };
        break;
      case "popular":
        sortQuery = { purchaseCount: -1 };
        break;
      case "rating":
        sortQuery = { rating: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    // Execute query
    const [templates, total] = await Promise.all([
      Template.find(query)
        .select("-fileUrl") // Don't expose file URL in listing
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Template.countDocuments(query),
    ]);

    return NextResponse.json({
      templates,
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
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create new template (Admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    // Generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Get category name if category ID provided
    if (body.category && !body.categoryName) {
      const category = await Category.findById(body.category);
      if (category) {
        body.categoryName = category.name;
      }
    }

    const template = new Template(body);
    await template.save();

    return NextResponse.json(
      { message: "Template created successfully", template },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

