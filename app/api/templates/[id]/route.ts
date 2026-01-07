import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Template from "@/app/models/template";
import Purchase from "@/app/models/purchase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET single template by ID or slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Try to find by ID first, then by slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let template: any = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      template = await Template.findById(id).lean();
    }

    if (!template) {
      template = await Template.findOne({ slug: id, isActive: true }).lean();
    }

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await Template.findByIdAndUpdate(template._id, {
      $inc: { viewCount: 1 },
    });

    // Check if current user has purchased this template
    const session = await getServerSession(authOptions);
    let hasPurchased = false;

    if (session?.user?.id) {
      const purchase = await Purchase.findOne({
        userId: session.user.id,
        templateId: template._id,
        paymentStatus: "paid",
        status: "active",
      });
      hasPurchased = !!purchase;
    }

    // Don't expose fileUrl unless user has purchased
    const templateResponse = {
      ...template,
      fileUrl: hasPurchased ? template.fileUrl : undefined,
      hasPurchased,
    };

    return NextResponse.json({ template: templateResponse });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PUT - Update template (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const template = await Template.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Template updated successfully",
      template,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete template (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Soft delete - just mark as inactive
    const template = await Template.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

