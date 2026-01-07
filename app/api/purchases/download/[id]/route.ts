import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/app/models/purchase";
import Template from "@/app/models/template";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Download template file
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to download" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    // Find purchase and verify ownership
    const purchase = await Purchase.findOne({
      _id: id,
      userId: session.user.id,
      paymentStatus: "paid",
      status: "active",
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found or not authorized" },
        { status: 404 }
      );
    }

    // Get the file URL (from template snapshot or current template)
    let fileUrl = purchase.templateSnapshot?.fileUrl;
    let fileName = purchase.templateSnapshot?.fileName;

    // Try to get updated file from template if still exists
    const template = await Template.findById(purchase.templateId);
    if (template && template.fileUrl) {
      fileUrl = template.fileUrl;
      fileName = template.fileName;
    }

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Template file not available" },
        { status: 404 }
      );
    }

    // Update download count
    await Purchase.findByIdAndUpdate(id, {
      $inc: { downloadCount: 1 },
      lastDownloadAt: new Date(),
    });

    // Return download URL (can be a signed URL for cloud storage)
    // For now, we'll return the file URL directly
    // In production, you might want to generate a time-limited signed URL
    return NextResponse.json({
      success: true,
      downloadUrl: fileUrl,
      fileName: fileName || "template.pptx",
      downloadCount: (purchase.downloadCount || 0) + 1,
    });
  } catch (error) {
    console.error("Error downloading template:", error);
    return NextResponse.json(
      { error: "Failed to download template" },
      { status: 500 }
    );
  }
}

