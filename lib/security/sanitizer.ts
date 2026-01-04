// Simple HTML tag removal for server-side (DOMPurify alternative)
function removeHtmlTags(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&[#\w]+;/g, "") // Remove HTML entities
    .trim();
}

// Try to import validator dynamically, use fallback if not available
// Using eval to prevent webpack from analyzing the require call
function getValidator() {
  try {
    // Use eval to prevent webpack static analysis
    // This allows the code to work even if validator is not installed
    // The webpack.IgnorePlugin in next.config.js will prevent webpack from bundling it
    const validator = eval(
      'typeof require !== "undefined" ? require("validator") : null'
    );
    return validator;
  } catch {
    // Validator not available, will use fallback validation
    return null;
  }
}

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return String(input);
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");

  // Remove HTML tags and entities
  sanitized = removeHtmlTags(sanitized);

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== "string") {
    return null;
  }

  const sanitized = email.toLowerCase().trim();

  // Use validator if available, otherwise use regex fallback
  const validator = getValidator();
  if (validator && typeof validator.isEmail === "function") {
    if (!validator.isEmail(sanitized)) {
      return null;
    }
  } else {
    // Fallback email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      return null;
    }
  }

  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string | null {
  if (typeof phone !== "string") {
    return null;
  }

  // Remove all non-digit characters except +
  const sanitized = phone.replace(/[^\d+]/g, "");

  if (sanitized.length < 10 || sanitized.length > 15) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== "string") {
    return null;
  }

  const sanitized = url.trim();

  // Only allow http and https protocols
  if (!sanitized.startsWith("http://") && !sanitized.startsWith("https://")) {
    return null;
  }

  // Use validator if available, otherwise use URL constructor fallback
  const validator = getValidator();
  if (validator && typeof validator.isURL === "function") {
    if (!validator.isURL(sanitized, { require_protocol: true })) {
      return null;
    }
  } else {
    // Fallback URL validation using URL constructor
    try {
      new URL(sanitized);
    } catch {
      return null;
    }
  }

  return sanitized;
}

/**
 * Sanitize MongoDB ObjectId
 */
export function sanitizeObjectId(id: string): string | null {
  if (typeof id !== "string") {
    return null;
  }

  const sanitized = id.trim();

  // Check if it's a valid ObjectId format (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize number (ensure it's a valid number)
 */
export function sanitizeNumber(
  value: unknown,
  min?: number,
  max?: number
): number | null {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
}

/**
 * Sanitize object - recursively sanitize all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitized[key as keyof T] = sanitizeObject(
        value as Record<string, unknown>
      ) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === "string"
          ? sanitizeString(item)
          : typeof item === "object" && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      ) as T[keyof T];
    } else {
      // For primitive values (number, boolean, etc.), cast to the expected type
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * Sanitize text input (allows some basic formatting)
 */
export function sanitizeText(input: string, maxLength?: number): string {
  if (typeof input !== "string") {
    return "";
  }

  let sanitized = sanitizeString(input);

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Remove potentially dangerous characters
 */
export function removeDangerousChars(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers like onclick=
}
