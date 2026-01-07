import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/app/models/purchase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET single purchase
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const purchase = await Purchase.findOne({
      _id: id,
      userId: session.user.id,
    })
      .populate("templateId")
      .lean();

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ purchase });
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}

