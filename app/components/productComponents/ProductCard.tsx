"use client";
import React, {
  lazy,
  Suspense,
  useState,
  memo,
  useCallback,
  useMemo,
} from "react";
// import Image from "next/image";
// import { assets } from "@/public/assets/assets";
import Link from "next/link";
import { ProductCardProps } from "../../types/types";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { useTranslations } from "next-intl";
// Import ProductImage directly for LCP candidates to avoid lazy loading delay
import ProductImage from "./ProductImage";
const ProductImageLazy = lazy(() => import("./ProductImage"));

interface ProductCardComponentProps {
  product: ProductCardProps;
  isLCP?: boolean; // Indicates if this is an LCP candidate
  isAboveFold?: boolean; // Indicates if this image is above the fold
}

const ProductCard = memo(
  ({
    product,
    isLCP = false,
    isAboveFold = false,
  }: ProductCardComponentProps) => {
    const t = useTranslations("common");
    const [imageError, setImageError] = useState(false);

    // Compute image URL synchronously during render instead of useEffect
    // This eliminates delay in image src assignment and improves LCP significantly
    const imageSrc = useMemo(() => {
      if (product._id) {
        const displayWidth = 320; // Max display size for product cards
        const displayHeight = 320;
        // Use optimized quality (80) for better compression while maintaining visual quality
        return getOptimizedImageUrl(
          product._id as string,
          0,
          displayWidth,
          displayHeight,
          80
        );
      }
      return "";
    }, [product._id]);

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    // Calculate discount percentage
    const discountPercentage = useMemo(() => {
      if (product.discount) {
        // If discount is provided as a string (e.g., "25")
        const discount = parseFloat(product.discount);
        return isNaN(discount) ? null : discount;
      }
      if (product.oldPrice && product.oldPrice > product.price) {
        // Calculate discount from oldPrice and current price
        const discount =
          ((product.oldPrice - product.price) / product.oldPrice) * 100;
        return Math.round(discount);
      }
      return null;
    }, [product.discount, product.oldPrice, product.price]);

    const hasDiscount = discountPercentage !== null && discountPercentage > 0;

    return (
      <div className="group relative bg-black rounded-2xl transition-all duration-300 overflow-hidden h-full flex flex-col mb-2 sm:mb-4 border border-gray-800 hover:border-primary-500 shadow-sm hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-1">
        {/* Product Link */}
        <Link href={`/product/${product._id}`} className="h-full flex flex-col">
          {/* Product Image Container */}
          <div
            className="relative bg-gradient-to-br from-primary-50 to-secondary-50 rounded-t-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ aspectRatio: "1 / 1" }}
          >
            {/* Discount Badge - Modern Tag Style */}
            {hasDiscount && (
              <div className="absolute top-0 -right-1 sm:top-0 sm:-right-1.5 z-10">
                <div className="relative flex items-center">
                  {/* Tag body */}
                  <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 pl-2 pr-3 sm:pl-2.5 sm:pr-4 py-1 sm:py-1.5  rounded-bl-full shadow-lg">
                    {/* Inner highlight */}
                    <div className="absolute inset-0 rounded-l-full bg-gradient-to-b from-white/20 to-transparent" />
                    {/* Text */}
                    <div className="relative flex items-center gap-0.5">
                      <span className="text-white/90 text-[10px] sm:text-xs font-bold">
                        -
                      </span>
                      <span className="text-white text-xs sm:text-sm font-black tracking-tight">
                        {discountPercentage}
                      </span>
                      <span className="text-white/90 text-[10px] sm:text-xs font-bold">
                        %
                      </span>
                    </div>
                  </div>
                  {/* Arrow point */}
                  {/* <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-primary-500 to-primary-700 rotate-45 shadow-sm" /> */}
                  {/* Tag hole */}
                  {/* <div className="absolute left-0.5 sm:left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/90 rounded-full shadow-inner" /> */}
                </div>
              </div>
            )}
            {imageSrc && !imageError ? (
              isLCP || isAboveFold ? (
                // Render LCP and above-fold images directly without lazy loading
                <ProductImage
                  productName={product.name}
                  imageSrc={imageSrc}
                  handleImageError={handleImageError}
                  fetchPriority={isLCP ? "high" : "auto"}
                  loading="eager"
                  context="product-card"
                  width={320}
                  height={320}
                  productId={product._id as string}
                />
              ) : (
                <Suspense
                  fallback={
                    <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
                      <span className="text-[#C9C9C9] text-sm">
                        {t("loading")}
                      </span>
                    </div>
                  }
                >
                  <ProductImageLazy
                    productName={product.name}
                    imageSrc={imageSrc}
                    handleImageError={handleImageError}
                    fetchPriority="auto"
                    loading="lazy"
                    context="product-card"
                    width={320}
                    height={320}
                    productId={product._id as string}
                  />
                </Suspense>
              )
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <span className="text-[#C9C9C9] text-sm">No image</span>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
          </div>

          {/* Product Details */}
          <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-3 flex-1 flex flex-col">
            {/* Product Name */}
            <h3 className="font-semibold text-white text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-primary-500 transition-colors duration-200">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-start pt-1 sm:pt-2 mt-auto">
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-lg text-primary-500">
                    {product.price} {t("currency")}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-[10px] sm:text-sm text-[#C9C9C9] line-through">
                      {product.oldPrice} {t("currency")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
