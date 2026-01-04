import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "../../../../models/user";
import { requireAuth, verifyOwnership } from "@/lib/security/authMiddleware";
import { sanitizeObjectId } from "@/lib/security/sanitizer";
import { cartUpdateSchema, safeParseInput } from "@/lib/security/validator";
import { createErrorResponse } from "@/lib/security/errorHandler";
import {
  logSecurityEvent,
  AuditEventType,
  extractRequestInfo,
} from "@/lib/security/auditLogger";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized", error: "Authentication required", cart: [] },
        { status: 401 }
      );
    }

    // 2. Validate and sanitize user ID
    const { id } = await params;
    const sanitizedId = sanitizeObjectId(id);
    if (!sanitizedId) {
      return NextResponse.json(
        { message: "Invalid user ID", error: "Invalid ID format", cart: [] },
        { status: 400 }
      );
    }

    // 3. Verify ownership
    if (!verifyOwnership(session.user.id, sanitizedId, session.user.isAdmin)) {
      const { ipAddress, userAgent } = extractRequestInfo(req);
      await logSecurityEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
        userId: session.user.id,
        userEmail: session.user.email,
        ipAddress,
        userAgent,
        resource: `/api/user/${sanitizedId}/cart`,
        action: "GET",
        result: "blocked",
        details: { attemptedUserId: sanitizedId },
      });

      return NextResponse.json(
        { message: "Forbidden", error: "Access denied", cart: [] },
        { status: 403 }
      );
    }

    await dbConnect();
    const userFound = await User.findById(sanitizedId).populate("cart");

    if (userFound) {
      const { cart } = userFound;
      return NextResponse.json({ cart: cart || [] }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "User Not Found", cart: [] },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error("Cart GET error:", err);
    return createErrorResponse(err, "Failed to fetch cart");
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // 2. Validate and sanitize user ID
    const { id } = await params;
    const sanitizedId = sanitizeObjectId(id);
    if (!sanitizedId) {
      return NextResponse.json(
        {
          message: "Invalid user ID",
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }

    // 3. Verify ownership
    if (!verifyOwnership(session.user.id, sanitizedId, session.user.isAdmin)) {
      const { ipAddress, userAgent } = extractRequestInfo(req);
      await logSecurityEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
        userId: session.user.id,
        userEmail: session.user.email,
        ipAddress,
        userAgent,
        resource: `/api/user/${sanitizedId}/cart`,
        action: "POST",
        result: "blocked",
        details: { attemptedUserId: sanitizedId },
      });

      return NextResponse.json(
        { message: "Forbidden", success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // 4. Parse and validate cart data
    const body = await req.json();
    const { cartToAdd } = body;
    const validation = safeParseInput(cartUpdateSchema, cartToAdd);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          success: false,
          error: "Invalid cart data",
          details: validation.errors.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    await dbConnect();
    const loggedUser = await User.findOne({ _id: sanitizedId });

    if (!loggedUser) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // Replace the user's cart with the validated cart
    loggedUser.cart = validation.data;
    await loggedUser.save();

    // Log data modification
    await logSecurityEvent(AuditEventType.DATA_MODIFIED, {
      userId: session.user.id,
      userEmail: session.user.email,
      ...extractRequestInfo(req),
      resource: `/api/user/${sanitizedId}/cart`,
      action: "POST",
      result: "success",
    });

    return NextResponse.json(
      { message: "Cart updated successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cart POST error:", error);
    return createErrorResponse(error, "Failed to update cart");
  }
}
