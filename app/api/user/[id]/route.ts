import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import User from "../../../models/user";
import { requireAuth, verifyOwnership } from "@/lib/security/authMiddleware";
import { sanitizeObjectId } from "@/lib/security/sanitizer";
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
        { message: "Unauthorized", error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Validate and sanitize user ID
    const { id } = await params;
    const sanitizedId = sanitizeObjectId(id);
    if (!sanitizedId) {
      return NextResponse.json(
        { message: "Invalid user ID", error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // 3. Verify ownership (user can only access their own data unless admin)
    if (!verifyOwnership(session.user.id, sanitizedId, session.user.isAdmin)) {
      const { ipAddress, userAgent } = extractRequestInfo(req);
      await logSecurityEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
        userId: session.user.id,
        userEmail: session.user.email,
        ipAddress,
        userAgent,
        resource: `/api/user/${sanitizedId}`,
        action: "GET",
        result: "blocked",
        details: { attemptedUserId: sanitizedId },
      });

      return NextResponse.json(
        { message: "Forbidden", error: "Access denied" },
        { status: 403 }
      );
    }

    await connectDB();
    const userFound = await User.findById(sanitizedId).select(
      "_id name email isAdmin cart"
    );

    if (userFound) {
      // Log data access
      await logSecurityEvent(AuditEventType.DATA_ACCESS, {
        userId: session.user.id,
        userEmail: session.user.email,
        ...extractRequestInfo(req),
        resource: `/api/user/${sanitizedId}`,
        action: "GET",
        result: "success",
      });

      const { _id, name, email, isAdmin, cart } = userFound;
      return NextResponse.json(
        { _id, name, email, isAdmin, cart },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "User Not Found", error: "User not found" },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error("Error fetching user:", err);
    return createErrorResponse(err, "Failed to fetch user");
  }
}
