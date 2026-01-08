import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/app/models/user";
import { checkAdminAccess } from "@/lib/adminAuth";

// DELETE - Revoke admin access from a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, session } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    // Prevent self-revocation
    if (session?.user?.email) {
      const targetUser = await User.findById(id);
      if (targetUser && targetUser.email === session.user.email) {
        return NextResponse.json(
          { message: "You cannot revoke your own admin access" },
          { status: 400 }
        );
      }
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { message: "User is not an admin" },
        { status: 400 }
      );
    }

    user.isAdmin = false;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Admin access revoked",
    });
  } catch (error) {
    console.error("Revoke admin error:", error);
    return NextResponse.json({ error: "Failed to revoke admin access" }, { status: 500 });
  }
}
