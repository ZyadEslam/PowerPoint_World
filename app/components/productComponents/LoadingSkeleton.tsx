import React from "react";

// Single product skeleton component - matches ProductCard dimensions
const ProductCardSkeleton = () => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton - matches ProductCard image container */}
      <div
        className="relative bg-secondaryLight rounded-t-2xl flex items-center justify-center"
        style={{ aspectRatio: "1 / 1" }}
      >
        <div className="w-full h-full bg-gray-200"></div>
      </div>

      {/* Product Details - matches ProductCard padding and spacing */}
      <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-3">
        {/* Product name skeleton */}
        <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>

        {/* Description skeleton - hidden on mobile */}
        <div className="hidden sm:block space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Price skeleton */}
        <div className="h-4 sm:h-6 bg-gray-300 rounded w-12 sm:w-16 mt-1 sm:mt-2"></div>
      </div>
    </div>
  );
};

// Group of product skeletons - matches ProductCard grid layout
const ProductSkeletonGroup = ({ count = 10 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`product-skeleton-${index}`} />
      ))}
    </div>
  );
};

// Alternative grid layout version - matches ProductCard dimensions
const ProductSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`grid-skeleton-${index}`} className="w-full">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export { ProductCardSkeleton, ProductSkeletonGroup, ProductSkeletonGrid };
