/**
 * Centralized caching utility for all fetch requests
 * Supports multiple cache strategies and automatic cache invalidation
 */

type CacheStrategy =
  | "default"
  | "no-store"
  | "force-cache"
  | "reload"
  | "only-if-cached";

interface CachedFetchOptions extends RequestInit {
  cache?: CacheStrategy;
  revalidate?: number; // Time in seconds to revalidate
  cacheKey?: string; // Custom cache key
  tags?: string[]; // Cache tags for invalidation
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache for client-side
const memoryCache = new Map<string, CacheEntry>();

// Pending requests map for request deduplication
// Tracks in-flight requests to prevent duplicate concurrent requests
const pendingRequests = new Map<string, Promise<Response>>();

// Cache configuration
const CACHE_CONFIG = {
  // Default cache times (in milliseconds)
  PRODUCTS: 30 * 1000, // 30 seconds
  CATEGORIES: 120 * 1000, // 2 minutes
  PROMO_CODES: 30 * 1000, // 30 seconds
  ADMINS: 120 * 1000, // 2 minutes
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  DEFAULT: 120 * 1000, // 2 minutes
};

/**
 * Get cache key from URL and options
 */
function getCacheKey(url: string, options?: CachedFetchOptions): string {
  if (options?.cacheKey) {
    return options.cacheKey;
  }

  // Create a unique key based on URL and method
  const method = options?.method || "GET";
  return `${method}:${url}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() < entry.expiresAt;
}

/**
 * Get cached data if available and valid
 */
function getCachedData(key: string): unknown | null {
  const entry = memoryCache.get(key);
  if (entry && isCacheValid(entry)) {
    return entry.data;
  }

  // Remove expired entry
  if (entry) {
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Set data in cache
 */
function setCachedData(key: string, data: unknown, ttl: number): void {
  const now = Date.now();
  memoryCache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + ttl,
  });
}

/**
 * Determine cache TTL based on URL
 */
function getCacheTTL(url: string, revalidate?: number): number {
  if (revalidate) {
    return revalidate * 1000;
  }

  // Auto-detect cache TTL based on endpoint
  if (url.includes("/api/product")) {
    return CACHE_CONFIG.PRODUCTS;
  }
  if (url.includes("/api/categories")) {
    return CACHE_CONFIG.CATEGORIES;
  }
  if (url.includes("/api/promo-code")) {
    return CACHE_CONFIG.PROMO_CODES;
  }
  if (url.includes("/api/admin/manage")) {
    return CACHE_CONFIG.ADMINS;
  }
  if (url.includes("/api/user")) {
    return CACHE_CONFIG.USER_DATA;
  }

  return CACHE_CONFIG.DEFAULT;
}

/**
 * Invalidate cache by tag or key
 */
export function invalidateCache(tagOrKey: string): void {
  // If it's a key, remove directly
  if (memoryCache.has(tagOrKey)) {
    memoryCache.delete(tagOrKey);
    return;
  }

  // If it's a tag, remove all entries with that tag
  // (For now, we'll use key-based invalidation)
  // In a more advanced implementation, you could store tags separately
  memoryCache.forEach((entry, key) => {
    if (key.includes(tagOrKey)) {
      memoryCache.delete(key);
    }
  });
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Cached fetch function with automatic cache management and request deduplication
 */
export async function cachedFetch(
  url: string,
  options?: CachedFetchOptions
): Promise<Response> {
  const cacheStrategy = options?.cache || "default";
  const method = options?.method || "GET";
  const requestKey = getCacheKey(url, options);

  // For GET requests, check cache first
  if (
    method === "GET" &&
    cacheStrategy !== "no-store" &&
    cacheStrategy !== "reload"
  ) {
    const cachedData = getCachedData(requestKey);

    if (cachedData && cacheStrategy === "force-cache") {
      // Return cached data immediately
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Request deduplication: if there's already a pending request for this URL, return it
  // This prevents multiple concurrent requests for the same resource
  if (method === "GET" && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!;
  }

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };

  // Create the fetch promise and store it for deduplication
  const fetchPromise = (async () => {
    try {
      // Make the actual fetch request
      const response = await fetch(url, fetchOptions);

      // Cache successful GET responses
      if (
        method === "GET" &&
        response.ok &&
        cacheStrategy !== "no-store" &&
        cacheStrategy !== "reload"
      ) {
        try {
          const data = await response.clone().json();
          const ttl = getCacheTTL(url, options?.revalidate);
          setCachedData(requestKey, data, ttl);
        } catch (error) {
          // If response is not JSON, don't cache
          console.warn("Failed to cache response:", error);
        }
      }

      return response;
    } finally {
      // Remove from pending requests once completed (success or failure)
      pendingRequests.delete(requestKey);
    }
  })();

  // Store the promise for request deduplication (only for GET requests)
  if (method === "GET") {
    pendingRequests.set(requestKey, fetchPromise);
  }

  return fetchPromise;
}

/**
 * Helper function to fetch JSON with caching
 */
export async function cachedFetchJson<T = unknown>(
  url: string,
  options?: CachedFetchOptions
): Promise<T> {
  const response = await cachedFetch(url, options);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorDetails: { message?: string; error?: string } =
          await response.json();
        errorMessage =
          errorDetails.message || errorDetails.error || errorMessage;
      } else {
        // If not JSON, try to get text
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
    } catch (parseError) {
      // If we can't parse the error, include status and statusText
      errorMessage = `HTTP ${response.status}: ${
        response.statusText || "Unknown error"
      }`;
      console.error("Failed to parse error response:", parseError);
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Pre-configured cache strategies for common endpoints
 */
export const cacheStrategies = {
  // Products - cache for 30 seconds
  products: (force = false): CachedFetchOptions => ({
    cache: force ? "no-store" : "default",
    revalidate: 30,
  }),

  // Categories - cache for 60 seconds
  categories: (force = false): CachedFetchOptions => ({
    cache: force ? "no-store" : "default",
    revalidate: 60,
  }),

  // Promo codes - cache for 30 seconds
  promoCodes: (force = false): CachedFetchOptions => ({
    cache: force ? "no-store" : "default",
    revalidate: 30,
  }),

  // Admin data - cache for 60 seconds
  admins: (force = false): CachedFetchOptions => ({
    cache: force ? "no-store" : "default",
    revalidate: 60,
  }),

  // User data - cache for 5 minutes
  userData: (force = false): CachedFetchOptions => ({
    cache: force ? "no-store" : "default",
    revalidate: 300,
  }),
};
