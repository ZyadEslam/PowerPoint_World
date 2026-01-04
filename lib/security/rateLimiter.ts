import { redisGet, redisSet } from "@/lib/redis";

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
  GENERAL: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 req/min
  AUTH: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 req/min
  PAYMENT: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 req/min
  ADMIN: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 req/min
  PRODUCT_CREATION: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 req/hour
  ORDER: { windowMs: 60 * 60 * 1000, maxRequests: 30 }, // 30 req/hour
} as const;

// Helper function to get identifier for rate limiting
export const getRateLimitIdentifier = (
  request: Request,
  userId?: string
): string => {
  // Use user ID if available, otherwise use IP address
  if (userId) {
    return `ratelimit:user:${userId}`;
  }

  // Get IP from headers (considering proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

  return `ratelimit:ip:${ip}`;
};

// Rate limit check using sliding window algorithm
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests in the window
    const key = identifier;
    const existingData = await redisGet<{
      requests: number[];
      count: number;
    }>(key);

    let requests: number[] = existingData?.requests || [];
    let count = existingData?.count || 0;

    // Remove requests outside the current window
    requests = requests.filter((timestamp) => timestamp > windowStart);
    count = requests.length;

    // Check if limit exceeded
    if (count >= config.maxRequests) {
      const oldestRequest = Math.min(...requests);
      const reset = oldestRequest + config.windowMs;

      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset,
      };
    }

    // Add current request
    requests.push(now);
    count = requests.length;

    // Store updated data with TTL
    const ttlSeconds = Math.ceil(config.windowMs / 1000);
    await redisSet(key, { requests, count }, ttlSeconds);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - count,
      reset: now + config.windowMs,
    };
  } catch {
    // If rate limiting fails, allow the request (fail open)
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
    };
  }
}

// Convenience functions for different rate limit types
export async function checkGeneralRateLimit(request: Request, userId?: string) {
  const identifier = getRateLimitIdentifier(request, userId);
  return checkRateLimit(identifier, RATE_LIMITS.GENERAL);
}

export async function checkAuthRateLimit(request: Request) {
  const identifier = getRateLimitIdentifier(request);
  return checkRateLimit(identifier, RATE_LIMITS.AUTH);
}

export async function checkPaymentRateLimit(request: Request, userId: string) {
  const identifier = getRateLimitIdentifier(request, userId);
  return checkRateLimit(identifier, RATE_LIMITS.PAYMENT);
}

export async function checkAdminRateLimit(request: Request, userId: string) {
  const identifier = getRateLimitIdentifier(request, userId);
  return checkRateLimit(identifier, RATE_LIMITS.ADMIN);
}

export async function checkProductCreationRateLimit(
  request: Request,
  userId: string
) {
  const identifier = getRateLimitIdentifier(request, userId);
  return checkRateLimit(identifier, RATE_LIMITS.PRODUCT_CREATION);
}

export async function checkOrderRateLimit(request: Request, userId?: string) {
  const identifier = getRateLimitIdentifier(request, userId);
  return checkRateLimit(identifier, RATE_LIMITS.ORDER);
}
