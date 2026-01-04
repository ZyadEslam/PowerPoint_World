"use client";
import React, { memo, useMemo } from "react";
import { ProductCardProps } from "../../types/types";
import ErrorBox from "../../UI/ErrorBox";
import { ProductSkeletonGroup } from "./LoadingSkeleton";
import ProductCard from "./ProductCard";

interface ProductsGroupProps {
  products: ProductCardProps[];
  isLoading: boolean;
  error: string | null;
  numOfProducts?: number;
  customClassName?: string;
  gridCols?: "2" | "3" | "4" | "5" | "6";
}

const ProductsGroup = memo(
  ({
    products,
    isLoading,
    error,
    numOfProducts,
    customClassName = "",
    gridCols = "6",
  }: ProductsGroupProps) => {
    // Memoize the filtered products to prevent unnecessary re-renders
    const productsToRender = useMemo(() => {
      if (!products) return [];
      return numOfProducts ? products.slice(0, numOfProducts) : products;
    }, [products, numOfProducts]);

    // Memoize the grid class to prevent recalculation
    const gridClass = useMemo(() => {
      const gridClasses = {
        "2": "grid-cols-2 md:grid-cols-2",
        "3": "grid-cols-2 md:grid-cols-3",
        "4": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        "5": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        "6": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
      };
      return gridClasses[gridCols];
    }, [gridCols]);

    if (isLoading) {
      return <ProductSkeletonGroup />;
    }

    if (error) {
      return <ErrorBox errorMessage={`Error loading products: ${error}`} />;
    }

    if (!productsToRender || productsToRender.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No products found</div>
          <p className="text-gray-500">
            Try adjusting your filters or browse other categories
          </p>
        </div>
      );
    }

    return (
      <section className={customClassName}>
        <div className={`grid ${gridClass} gap-3 sm:gap-4 md:gap-6`}>
          {productsToRender.map((product: ProductCardProps, index: number) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              isLCP={index === 0} // First product is LCP candidate
            />
          ))}
        </div>
      </section>
    );
  }
);

ProductsGroup.displayName = "ProductsGroup";

export default ProductsGroup;
