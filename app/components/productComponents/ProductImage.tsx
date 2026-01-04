import React, { useState, useCallback } from "react";
import { getImageSizes, getImageSrcSet } from "../../utils/imageUtils";

interface ProductImageProps {
  imageSrc: string;
  productName: string;
  handleImageError?: () => void;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "lazy" | "eager";
  context?: "product-card" | "product-detail" | "thumbnail" | "hero";
  width?: number;
  height?: number;
  productId?: string;
  showPlaceholder?: boolean;
}

const ProductImage = ({
  imageSrc,
  productName,
  handleImageError,
  fetchPriority = "auto",
  loading = "lazy",
  context = "product-card",
  width = 400,
  height = 400,
  productId,
  showPlaceholder = true,
}: ProductImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const sizes = getImageSizes(context);

  // Generate srcset for responsive images if productId is provided
  // Simplified srcset with fewer sizes for faster loading
  const srcset =
    productId && context !== "thumbnail"
      ? getImageSrcSet(
          productId,
          0,
          context === "product-card"
            ? [320, 640] // Simplified: 320 for mobile, 640 for retina/desktop
            : [400, 800]
        )
      : undefined;

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const onError = useCallback(() => {
    setHasError(true);
    handleImageError?.();
  }, [handleImageError]);

  // Use regular img tag for our custom API routes to bypass Next.js Image validation
  // Our API route handles all optimization (resizing, format conversion, etc.)
  return (
    <div className="relative w-full h-full">
      {/* Simple placeholder - shows while image is loading */}
      {showPlaceholder && !isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50"
        />
      )}

      {/* Main image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        srcSet={srcset}
        alt={productName || "Product Image"}
        width={width}
        height={height}
        sizes={sizes}
        fetchPriority={fetchPriority}
        loading={loading}
        className={`block h-full w-full max-h-full max-w-full object-contain object-center mx-auto transition-opacity duration-200 hover:scale-[1.02] ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleLoad}
        onError={onError}
        decoding="async"
      />
    </div>
  );
};

export default ProductImage;
