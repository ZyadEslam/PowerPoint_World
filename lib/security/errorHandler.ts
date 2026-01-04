import { NextResponse } from "next/server";

/**
 * Secure error handler - prevents information leakage
 */
export class SecurityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public userMessage?: string
  ) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * Create a secure error response
 * In production, only shows generic messages to users
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = "An error occurred"
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === "development";

  let statusCode = 500;
  let userMessage = defaultMessage;
  let devMessage: string | undefined;

  if (error instanceof SecurityError) {
    statusCode = error.statusCode;
    userMessage = error.userMessage || error.message;
    if (isDevelopment) {
      devMessage = error.message;
    }
  } else if (error instanceof Error) {
    // In development, show more details
    if (isDevelopment) {
      devMessage = error.message;
      userMessage = error.message;
    }

    // Handle specific error types
    if (
      error.message.includes("validation") ||
      error.message.includes("Invalid")
    ) {
      statusCode = 400;
      userMessage = "Invalid input provided";
    } else if (
      error.message.includes("Unauthorized") ||
      error.message.includes("authentication")
    ) {
      statusCode = 401;
      userMessage = "Authentication required";
    } else if (
      error.message.includes("Forbidden") ||
      error.message.includes("permission")
    ) {
      statusCode = 403;
      userMessage = "Access denied";
    } else if (
      error.message.includes("Not Found") ||
      error.message.includes("not found")
    ) {
      statusCode = 404;
      userMessage = "Resource not found";
    }
  }

  // Error handled silently for production

  const response: {
    error: string;
    message: string;
    details?: string;
  } = {
    error: getErrorType(statusCode),
    message: userMessage,
  };

  if (isDevelopment && devMessage) {
    response.details = devMessage;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Get error type from status code
 */
function getErrorType(statusCode: number): string {
  if (statusCode >= 400 && statusCode < 500) {
    return "Client Error";
  }
  if (statusCode >= 500) {
    return "Server Error";
  }
  return "Error";
}

/**
 * Validate and sanitize error before sending
 */
export function sanitizeError(error: unknown): {
  message: string;
  statusCode: number;
} {
  if (error instanceof SecurityError) {
    return {
      message: error.userMessage || "An error occurred",
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    // Remove sensitive information from error messages
    let message = error.message;

    // Remove file paths
    message = message.replace(/[A-Z]:\\[^\s]+/gi, "[path]");
    message = message.replace(/\/[^\s]+/g, "[path]");

    // Remove connection strings
    message = message.replace(/mongodb\+srv:\/\/[^\s]+/gi, "[connection]");
    message = message.replace(/redis:\/\/[^\s]+/gi, "[connection]");

    // Remove API keys
    message = message.replace(/[A-Za-z0-9]{32,}/g, "[key]");

    return {
      message:
        process.env.NODE_ENV === "development" ? message : "An error occurred",
      statusCode: 500,
    };
  }

  return {
    message: "An error occurred",
    statusCode: 500,
  };
}
