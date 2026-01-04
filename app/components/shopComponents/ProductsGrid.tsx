"use client";
import React, { memo } from "react";
import ProductCard from "../productComponents/ProductCard";
import { ProductCardProps } from "../../types/types";
import { ProductSkeletonGroup } from "../productComponents/LoadingSkeleton";
import ErrorBox from "../../UI/ErrorBox";

interface ProductsGridProps {
  products: ProductCardProps[];
  isLoading: boolean;
  error: string | null;
  className?: string;
  gridCols?: "2" | "3" | "4" | "5" | "6";
}

const ProductsGrid = memo(
  ({
    products,
    isLoading,
    error,
    className = "",
    gridCols = "6",
  }: ProductsGridProps) => {
    if (isLoading) {
      return <ProductSkeletonGroup />;
    }

    if (error) {
      return <ErrorBox errorMessage={`Error loading products: ${error}`} />;
    }

    if (!products || products.length === 0) {
      return null; // ProductsGrid doesn't handle empty state, let the parent handle it
    }

    const gridClass = {
      "2": "grid-cols-2 md:grid-cols-2",
      "3": "grid-cols-2 md:grid-cols-3",
      "4": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
      "5": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
      "6": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    }[gridCols];

    return (
      <div className={`grid ${gridClass} gap-3 sm:gap-4 md:gap-6 ${className}`}>
        {products.map((product: ProductCardProps, index: number) => (
          <ProductCard
            key={product._id}
            product={product}
            isLCP={index === 0} // First product is LCP candidate
            isAboveFold={index < 8} // First 8 products are above the fold (covers 2 rows on desktop)
          />
        ))}
      </div>
    );
  }
);

ProductsGrid.displayName = "ProductsGrid";

export default ProductsGrid;
