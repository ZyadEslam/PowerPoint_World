import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * Require authentication - returns session or null
 */
export async function requireAuth(): Promise<{
  user: { id: string; email: string; name?: string; isAdmin?: boolean };
} | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || undefined,
        isAdmin: session.user.isAdmin || false,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Require admin access - returns session or null
 */
export async function requireAdminAccess() {
  return requireAdmin();
}

/**
 * Verify user owns the resource
 * @param userId - User ID from session
 * @param resourceUserId - User ID from the resource
 * @returns true if user owns the resource or is admin
 */
export function verifyOwnership(
  userId: string,
  resourceUserId: string | { toString: () => string },
  isAdmin = false
): boolean {
  if (isAdmin) {
    return true; // Admins can access any resource
  }

  const resourceId =
    typeof resourceUserId === "string"
      ? resourceUserId
      : resourceUserId.toString();

  return userId === resourceId;
}

/**
 * Middleware wrapper for authenticated routes
 */
export async function withAuth(
  handler: (
    req: NextRequest,
    session: {
      user: { id: string; email: string; name?: string; isAdmin?: boolean };
    }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    return handler(req, session);
  };
}

/**
 * Middleware wrapper for admin-only routes
 */
export async function withAdmin(
  handler: (
    req: NextRequest,
    session: {
      user: { id: string; email: string; name?: string; isAdmin?: boolean };
    }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const adminSession = await requireAdminAccess();

    if (!adminSession) {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access required" },
        { status: 403 }
      );
    }

    const session = await requireAuth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    return handler(req, session);
  };
}

/**
 * Middleware wrapper for routes that require ownership
 */
export async function withOwnership(
  getResourceUserId: (req: NextRequest) => Promise<string | null>,
  handler: (
    req: NextRequest,
    session: {
      user: { id: string; email: string; name?: string; isAdmin?: boolean };
    }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const resourceUserId = await getResourceUserId(req);

    if (!resourceUserId) {
      return NextResponse.json(
        { error: "Not Found", message: "Resource not found" },
        { status: 404 }
      );
    }

    if (
      !verifyOwnership(session.user.id, resourceUserId, session.user.isAdmin)
    ) {
      return NextResponse.json(
        { error: "Forbidden", message: "Access denied" },
        { status: 403 }
      );
    }

    return handler(req, session);
  };
}
