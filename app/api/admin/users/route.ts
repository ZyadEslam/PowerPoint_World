import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/app/models/user";
import { checkAdminAccess } from "@/lib/adminAuth";

// GET - List all admin users
export async function GET() {
  try {
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const admins = await User.find({ isAdmin: true })
      .select("name email image isAdmin createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ admins });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 });
  }
}

// POST - Grant admin access to a user
export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "User not found. The user must have an existing account." },
        { status: 404 }
      );
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { message: "User is already an admin" },
        { status: 400 }
      );
    }

    user.isAdmin = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Admin access granted",
      admin: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Grant admin error:", error);
    return NextResponse.json({ error: "Failed to grant admin access" }, { status: 500 });
  }
}
