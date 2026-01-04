import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

// Security middleware wrapper
export default async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes (skip in Edge Runtime to avoid dynamic code evaluation)
  // Rate limiting will be handled in individual API routes instead
  if (request.nextUrl.pathname.startsWith("/api/")) {
    try {
      // Dynamic import only in Node.js runtime
      if (
        typeof process !== "undefined" &&
        process.env.NEXT_RUNTIME !== "edge"
      ) {
        const { checkGeneralRateLimit } = await import(
          "@/lib/security/rateLimiter"
        );
        const { logRateLimitExceeded } = await import(
          "@/lib/security/auditLogger"
        );

        const rateLimitResult = await checkGeneralRateLimit(request);

        if (!rateLimitResult.success) {
          await logRateLimitExceeded(
            request.headers.get("x-forwarded-for") || "unknown",
            request.nextUrl.pathname,
            request
          );

          return NextResponse.json(
            {
              error: "Too Many Requests",
              message: "Rate limit exceeded. Please try again later.",
            },
            {
              status: 429,
              headers: {
                "Retry-After": String(
                  Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
                ),
                "X-RateLimit-Limit": String(rateLimitResult.limit),
                "X-RateLimit-Remaining": String(rateLimitResult.remaining),
                "X-RateLimit-Reset": String(rateLimitResult.reset),
              },
            }
          );
        }

        // Add rate limit headers to successful requests
        const response = NextResponse.next();
        response.headers.set(
          "X-RateLimit-Limit",
          String(rateLimitResult.limit)
        );
        response.headers.set(
          "X-RateLimit-Remaining",
          String(rateLimitResult.remaining)
        );
        response.headers.set(
          "X-RateLimit-Reset",
          String(rateLimitResult.reset)
        );

        // Add security headers to all API responses
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("X-XSS-Protection", "1; mode=block");
        response.headers.set(
          "Referrer-Policy",
          "strict-origin-when-cross-origin"
        );
        response.headers.set(
          "Permissions-Policy",
          "camera=(), microphone=(), geolocation=()"
        );

        // Validate request size (prevent large payload attacks)
        const contentLength = request.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
          // 10MB limit
          return NextResponse.json(
            {
              error: "Request too large",
              message: "Payload size exceeds limit",
            },
            { status: 413 }
          );
        }

        return response;
      } else {
        // In Edge Runtime, just add security headers without rate limiting
        const response = NextResponse.next();
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("X-XSS-Protection", "1; mode=block");
        response.headers.set(
          "Referrer-Policy",
          "strict-origin-when-cross-origin"
        );
        response.headers.set(
          "Permissions-Policy",
          "camera=(), microphone=(), geolocation=()"
        );
        return response;
      }
    } catch (error) {
      // If rate limiting fails, continue (fail open)
    }
  }

  // Apply internationalization middleware for non-API routes
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(ar|en)/:path*",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!_next|_vercel|.*\\..*|api|.*\\.[^.]*$).*)",

    // Also match API routes for security middleware
    "/api/:path*",
  ],
};
