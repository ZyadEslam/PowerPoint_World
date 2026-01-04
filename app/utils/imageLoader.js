/**
 * Custom image loader for Next.js Image component
 * Bypasses Next.js validation for our custom API routes
 * Since we handle optimization in our API route with Sharp, we just return the src as-is
 */
export default function customImageLoader({ src }) {
  // For our custom API routes, return the src as-is (our API handles all optimization)
  // width and quality are handled by the API route query parameters
  if (src.startsWith("/api/product/image/")) {
    return src;
  }
  
  // For other images, you could add custom logic here if needed
  // For now, just return the src as-is since unoptimized: true
  return src;
}

