export const bufferToBase64 = (
  buffer: Buffer | Uint8Array | null | undefined
): string | null => {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${Buffer.from(buffer).toString("base64")}`;
};

interface ProductWithImages {
  imgSrc?: (Buffer | Uint8Array | null | undefined)[];
}

export const getProductImages = (
  product: ProductWithImages | null | undefined
): string[] => {
  if (!product?.imgSrc) return [];
  return product.imgSrc
    .map(bufferToBase64)
    .filter((img): img is string => Boolean(img));
};

/**
 * Generate a tiny blur placeholder data URL
 * Uses a 10x10 pixel placeholder that will be stretched and blurred by CSS
 * This is generated client-side as a simple gradient placeholder
 */
export const getBlurPlaceholder = (): string => {
  // Return a tiny SVG blur placeholder (much smaller than base64 images)
  // This creates a neutral gray gradient that works well with any image
  return `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f3f4f6'/%3E%3Cstop offset='100%25' stop-color='%23e5e7eb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='10' height='10'/%3E%3C/svg%3E`;
};

/**
 * Generate URL for blur placeholder from the API
 * Returns a tiny version of the actual image for LQIP (Low Quality Image Placeholder)
 * @param productId - Product ID
 * @param index - Image index (default: 0)
 */
export const getBlurPlaceholderUrl = (
  productId: string,
  index: number = 0
): string => {
  // Request a tiny 20x20 image with very low quality for blur effect
  return `/api/product/image/${productId}?index=${index}&w=20&h=20&q=20`;
};

/**
 * Generate optimized image URL with size parameters
 * @param productId - Product ID
 * @param index - Image index (default: 0)
 * @param width - Desired width in pixels
 * @param height - Desired height in pixels (optional, maintains aspect ratio if not provided)
 * @param quality - Image quality 1-100 (default: 85)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  productId: string,
  index: number = 0,
  width?: number,
  height?: number,
  quality: number = 85
): string => {
  const baseUrl = `/api/product/image/${productId}?index=${index}`;
  const params = new URLSearchParams();

  if (width) params.append("w", width.toString());
  if (height) params.append("h", height.toString());
  if (quality !== 85) params.append("q", quality.toString());

  const queryString = params.toString();
  return queryString ? `${baseUrl}&${queryString}` : baseUrl;
};

/**
 * Generate srcset for responsive images
 * Sizes are optimized for both 1x displays AND retina displays (2x, 3x DPR)
 * @param productId - Product ID
 * @param index - Image index (default: 0)
 * @param sizes - Array of widths to generate
 * @returns srcset string
 */
export const getImageSrcSet = (
  productId: string,
  index: number = 0,
  sizes: number[] = [320, 480, 640, 800] // Optimized for product cards including retina displays
): string => {
  return sizes
    .map((width) => {
      const url = getOptimizedImageUrl(productId, index, width, width, 80); // Use optimized quality
      return `${url} ${width}w`;
    })
    .join(", ");
};

/**
 * Check if an image should be treated as LCP (Largest Contentful Paint) candidate
 * @param index - Image index in the list
 * @param maxLCPCandidates - Maximum number of LCP candidates (default: 1)
 * @returns true if image should be prioritized for LCP
 */
export const isLCPImage = (
  index: number,
  maxLCPCandidates: number = 1
): boolean => {
  return index < maxLCPCandidates;
};

/**
 * Get appropriate image sizes attribute for responsive images
 * @param context - Context where image is displayed
 * @returns sizes attribute string
 */
export const getImageSizes = (
  context:
    | "product-card"
    | "product-detail"
    | "thumbnail"
    | "hero" = "product-card"
): string => {
  switch (context) {
    case "product-card":
      return "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw";
    case "product-detail":
      return "(max-width: 768px) 100vw, 33vw";
    case "thumbnail":
      return "80px";
    case "hero":
      return "100vw";
    default:
      return "(max-width: 640px) 100vw, 50vw";
  }
};

/**
 * Get recommended image dimensions based on context
 * @param context - Context where image is displayed
 * @returns Object with width and height
 */
export const getImageDimensions = (
  context:
    | "product-card"
    | "product-detail"
    | "thumbnail"
    | "hero" = "product-card"
): { width: number; height: number } => {
  switch (context) {
    case "product-card":
      // Match actual display size: mobile ~260px, sm+ ~320px
      return { width: 320, height: 320 };
    case "product-detail":
      return { width: 800, height: 800 };
    case "thumbnail":
      return { width: 80, height: 80 };
    case "hero":
      return { width: 1920, height: 1080 };
    default:
      return { width: 320, height: 320 };
  }
};
