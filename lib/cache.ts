import {
  redisGet,
  redisSet,
  redisDelete,
  checkRedisAvailability,
} from "./redis";

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  PRODUCT_LIST: 300, // 5 minutes
  PRODUCT_SINGLE: 600, // 10 minutes
  CATEGORIES: 600, // 10 minutes
  CATEGORY_SINGLE: 600, // 10 minutes
  CATEGORY_PRODUCTS: 600, // 10 minutes
  SETTINGS: 1800, // 30 minutes
  HERO_SECTION: 1800, // 30 minutes
} as const;

// Cache key generators
export const getProductListCacheKey = (): string => {
  return "product:list";
};

export const getProductCacheKey = (id: string): string => {
  return `product:${id}`;
};

export const getCategoriesCacheKey = (params: {
  featured?: string | null;
  active?: string | null;
  limit?: string | null;
  includeProducts?: boolean;
}): string => {
  const { featured, active, limit, includeProducts } = params;
  const parts = ["categories"];

  if (featured) parts.push(`featured:${featured}`);
  if (active) parts.push(`active:${active}`);
  if (limit) parts.push(`limit:${limit}`);
  if (includeProducts) parts.push("withProducts");

  return parts.join(":");
};

export const getCategoryCacheKey = (slug: string): string => {
  return `category:${slug}`;
};

export const getCategoryProductsCacheKey = (
  slug: string,
  limit?: number
): string => {
  return `category:${slug}:products:${limit || "default"}`;
};

export const getSettingsCacheKey = (): string => {
  return "settings";
};

export const getHeroSectionCacheKey = (): string => {
  return "hero-section";
};

// Generic cache getter
export const getCachedData = async <T = unknown>(
  key: string
): Promise<T | null> => {
  if (!checkRedisAvailability()) {
    return null;
  }

  try {
    const data = await redisGet<T>(key);
    return data;
  } catch {
    return null;
  }
};

// Generic cache setter
export const setCachedData = async (
  key: string,
  data: unknown,
  ttl?: number
): Promise<boolean> => {
  if (!checkRedisAvailability()) {
    return false;
  }

  try {
    const success = await redisSet(key, data, ttl);
    return success;
  } catch {
    return false;
  }
};

// Cache invalidation
export const invalidateCache = async (key: string): Promise<boolean> => {
  if (!checkRedisAvailability()) {
    return false;
  }

  try {
    const success = await redisDelete(key);
    return success;
  } catch {
    return false;
  }
};

// Invalidate multiple cache keys
export const invalidateMultipleCaches = async (
  keys: string[]
): Promise<number> => {
  if (!checkRedisAvailability()) {
    return 0;
  }

  let successCount = 0;
  for (const key of keys) {
    const success = await invalidateCache(key);
    if (success) {
      successCount++;
    }
  }

  return successCount;
};

// Invalidate product-related caches
export const invalidateProductCaches = async (
  productId?: string
): Promise<void> => {
  const keysToInvalidate: string[] = [getProductListCacheKey()];

  if (productId) {
    keysToInvalidate.push(getProductCacheKey(productId));
  }

  await invalidateMultipleCaches(keysToInvalidate);
};

// Invalidate category-related caches
export const invalidateCategoryCaches = async (
  categorySlug?: string
): Promise<void> => {
  // Invalidate all category-related caches
  // Since we can't easily pattern match, we'll invalidate common patterns
  const keysToInvalidate: string[] = [];

  // Invalidate category list caches (common query patterns)
  keysToInvalidate.push(getCategoriesCacheKey({}));
  keysToInvalidate.push(getCategoriesCacheKey({ active: "true" }));
  keysToInvalidate.push(getCategoriesCacheKey({ featured: "true" }));
  keysToInvalidate.push(
    getCategoriesCacheKey({ active: "true", featured: "true" })
  );

  if (categorySlug) {
    keysToInvalidate.push(getCategoryCacheKey(categorySlug));
    // Invalidate category products (common limits)
    for (const limit of [8, 12, 20, "default"]) {
      keysToInvalidate.push(
        getCategoryProductsCacheKey(categorySlug, limit as number)
      );
    }
  }

  await invalidateMultipleCaches(keysToInvalidate);
};
