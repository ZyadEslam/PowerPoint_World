// Check if Redis is available
// Support both Vercel KV (KV_REST_API_URL + KV_REST_API_TOKEN) and direct Redis (REDIS_URL or espesyal_REDIS_URL)
const isRedisAvailable = (): boolean => {
  // Check for direct Redis connection (Redis Labs, etc.)
  const redisUrl = process.env.espesyal_REDIS_URL || process.env.REDIS_URL;
  if (redisUrl && redisUrl.startsWith("redis://")) {
    return true;
  }

  // Check for Vercel KV REST API
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (
    kvUrl &&
    kvToken &&
    !kvUrl.includes("your-database-name") &&
    !kvToken.includes("your-kv-rest-api-token")
  ) {
    return true;
  }

  return false;
};

// Redis client - supports both direct Redis connection and Vercel KV
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null;
let redisLoadAttempted = false;

// Lazy load the Redis client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRedisClient = async (): Promise<any> => {
  if (!isRedisAvailable()) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  // Prevent multiple load attempts
  if (redisLoadAttempted) {
    return null;
  }

  redisLoadAttempted = true;

  try {
    // Check for direct Redis connection first (Redis Labs, etc.)
    const redisUrl = process.env.espesyal_REDIS_URL || process.env.REDIS_URL;
    if (redisUrl && redisUrl.startsWith("redis://")) {
      // Use redis package for direct connections
      // Use require() for server-side code (API routes)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const redisModule = require("redis");
      const { createClient } = redisModule;

      redisClient = createClient({ url: redisUrl });
      await redisClient.connect();

      return redisClient;
    }

    // Fallback to Vercel KV REST API
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (kvUrl && kvToken) {
      // Use dynamic import for @vercel/kv since it might not be installed
      const dynamicImport = new Function(
        "moduleName",
        "return import(moduleName)"
      );
      const kvModule = await dynamicImport("@vercel/kv");
      redisClient = kvModule.kv;

      return redisClient;
    }
  } catch {
    return null;
  }

  return null;
};

// Get Redis client (cached connection) - synchronous version for compatibility
// Note: This returns the client if already connected, but connection is async
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRedisClientSync = (): any => {
  if (!isRedisAvailable() || !redisClient) {
    return null;
  }
  return redisClient;
};

// Base cache operations with error handling
export const redisGet = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }

    const value = await client.get(key);
    // Parse JSON if value is a string
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    }
    return value as T;
  } catch {
    return null;
  }
};

export const redisSet = async (
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    // Serialize value to JSON string for Redis
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);

    if (ttlSeconds && ttlSeconds > 0) {
      await client.setEx(key, ttlSeconds, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }

    return true;
  } catch {
    return false;
  }
};

export const redisDelete = async (key: string): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    await client.del(key);
    return true;
  } catch {
    return false;
  }
};

// Pattern-based deletion (for cache invalidation)
export const redisDeletePattern = async (pattern: string): Promise<number> => {
  try {
    const client = await getRedisClient();
    if (!client) {
      return 0;
    }

    // Use SCAN to find keys matching the pattern
    let cursor = 0;
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    do {
      const result = await client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = result.cursor;
      keysToDelete.push(...result.keys);
    } while (cursor !== 0);

    // Delete all matching keys
    if (keysToDelete.length > 0) {
      await client.del(keysToDelete);
      deletedCount = keysToDelete.length;
    }

    return deletedCount;
  } catch {
    // If SCAN is not available (e.g., Vercel KV), fall back silently
    return 0;
  }
};

// Check if Redis is available
export const checkRedisAvailability = (): boolean => {
  return isRedisAvailable();
};
