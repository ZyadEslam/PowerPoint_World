import { Redis } from '@upstash/redis';

// Check if Redis is available
// Support Upstash Redis REST API (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
const isRedisAvailable = (): boolean => {
  // Check for Upstash Redis REST API
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (
    upstashUrl &&
    upstashToken &&
    upstashUrl.startsWith("https://") &&
    !upstashUrl.includes("your-database-name") &&
    !upstashToken.includes("your-token")
  ) {
    return true;
  }

  // Legacy support: Check for Vercel KV REST API (for backward compatibility)
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

// Redis client instance
let redisClient: Redis | null = null;
let redisLoadAttempted = false;

// Initialize Redis client
const getRedisClient = (): Redis | null => {
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
    // Check for Upstash Redis REST API first
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      redisClient = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
      console.log('Redis: Upstash Redis client initialized');
      return redisClient;
    }

    // Fallback to Vercel KV REST API (for backward compatibility)
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (kvUrl && kvToken) {
      // Note: Vercel KV uses a different API, but we'll try to use it if available
      // This is for backward compatibility only
      console.log('Redis: Vercel KV detected (legacy support)');
      return null; // Vercel KV would need separate handling
    }
  } catch (error) {
    console.error('Redis: Failed to initialize client:', error);
    return null;
  }

  return null;
};

// Get Redis client (cached instance) - synchronous version for compatibility
export const getRedisClientSync = (): Redis | null => {
  return getRedisClient();
};

// Base cache operations with error handling
export const redisGet = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return null;
    }

    const value = await client.get(key);
    
    // Upstash Redis returns the value directly (already parsed if it was JSON)
    // If it's a string that looks like JSON, try to parse it
    if (typeof value === "string") {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(value);
        return parsed as T;
      } catch {
        // If parsing fails, return as string
        return value as T;
      }
    }
    
    return value as T;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
};

export const redisSet = async (
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    // Serialize value to JSON string for Redis
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);

    if (ttlSeconds && ttlSeconds > 0) {
      // Upstash Redis supports setex for TTL (standard Redis command)
      await client.setex(key, ttlSeconds, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }

    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
};

export const redisDelete = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return false;
  }
};

// Pattern-based deletion (for cache invalidation)
export const redisDeletePattern = async (pattern: string): Promise<number> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return 0;
    }

    // Upstash Redis supports KEYS command for pattern matching
    // Note: KEYS can be slow on large datasets, but Upstash handles it efficiently
    const keys = await client.keys(pattern);
    
    if (keys && keys.length > 0) {
      // Delete all matching keys
      await client.del(...keys);
      return keys.length;
    }

    return 0;
  } catch (error) {
    console.error('Redis DELETE PATTERN error:', error);
    // If KEYS is not available or fails, fall back silently
    return 0;
  }
};

// Check if Redis is available
export const checkRedisAvailability = (): boolean => {
  return isRedisAvailable();
};
