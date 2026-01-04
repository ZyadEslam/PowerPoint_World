import { redisSet } from "@/lib/redis";

export enum AuditEventType {
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILURE = "login_failure",
  LOGOUT = "logout",
  ADMIN_ACTION = "admin_action",
  PAYMENT_CREATED = "payment_created",
  PAYMENT_FAILED = "payment_failed",
  ORDER_CREATED = "order_created",
  DATA_ACCESS = "data_access",
  DATA_MODIFIED = "data_modified",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  VALIDATION_FAILED = "validation_failed",
}

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  result: "success" | "failure" | "blocked";
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Log security events for audit purposes
 */
export async function logSecurityEvent(
  eventType: AuditEventType,
  options: {
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    resource?: string;
    action?: string;
    result: "success" | "failure" | "blocked";
    details?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const logEntry: AuditLogEntry = {
      eventType,
      userId: options.userId,
      userEmail: options.userEmail,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      resource: options.resource,
      action: options.action,
      result: options.result,
      details: options.details,
      timestamp: new Date().toISOString(),
    };

    // Store in Redis with 90-day TTL (can be extended to database)
    const logKey = `audit:${eventType}:${Date.now()}:${
      options.userId || "anonymous"
    }`;
    await redisSet(logKey, logEntry, 90 * 24 * 60 * 60); // 90 days
  } catch {
    // Don't throw - logging failures shouldn't break the application
    // Error handled silently for production
  }
}

/**
 * Helper to extract request information for logging
 */
export function extractRequestInfo(request: Request): {
  ipAddress?: string;
  userAgent?: string;
} {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || undefined;
  const userAgent = request.headers.get("user-agent") || undefined;

  return {
    ipAddress: ip,
    userAgent,
  };
}

/**
 * Convenience functions for common audit events
 */
export async function logLoginSuccess(
  userId: string,
  userEmail: string,
  request: Request
) {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  await logSecurityEvent(AuditEventType.LOGIN_SUCCESS, {
    userId,
    userEmail,
    ipAddress,
    userAgent,
    result: "success",
  });
}

export async function logLoginFailure(
  email: string,
  request: Request,
  reason?: string
) {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  await logSecurityEvent(AuditEventType.LOGIN_FAILURE, {
    userEmail: email,
    ipAddress,
    userAgent,
    result: "failure",
    details: reason ? { reason } : undefined,
  });
}

export async function logAdminAction(
  userId: string,
  userEmail: string,
  action: string,
  resource: string,
  request: Request,
  details?: Record<string, unknown>
) {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  await logSecurityEvent(AuditEventType.ADMIN_ACTION, {
    userId,
    userEmail,
    ipAddress,
    userAgent,
    action,
    resource,
    result: "success",
    details,
  });
}

export async function logPaymentEvent(
  eventType: AuditEventType.PAYMENT_CREATED | AuditEventType.PAYMENT_FAILED,
  userId: string,
  userEmail: string,
  request: Request,
  details?: Record<string, unknown>
) {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  await logSecurityEvent(eventType, {
    userId,
    userEmail,
    ipAddress,
    userAgent,
    result:
      eventType === AuditEventType.PAYMENT_CREATED ? "success" : "failure",
    details,
  });
}

export async function logUnauthorizedAccess(
  userId: string | undefined,
  resource: string,
  request: Request,
  reason?: string
) {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  await logSecurityEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
    userId,
    ipAddress,
    userAgent,
    resource,
    result: "blocked",
    details: reason ? { reason } : undefined,
  });
}

export async function logRateLimitExceeded(
  identifier: string,
  endpoint: string,
  request: Request
) {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  await logSecurityEvent(AuditEventType.RATE_LIMIT_EXCEEDED, {
    ipAddress,
    userAgent,
    resource: endpoint,
    result: "blocked",
    details: { identifier },
  });
}
