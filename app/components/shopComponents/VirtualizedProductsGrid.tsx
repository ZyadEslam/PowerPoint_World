"use client";
import React, { memo, useMemo, useCallback } from "react";
import { ProductCardProps } from "../../types/types";
import ProductCard from "../productComponents/ProductCard";

interface VirtualizedProductsGridProps {
  products: ProductCardProps[];
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

const VirtualizedProductsGrid = memo(
  ({
    products,
    itemHeight = 300,
    containerHeight = 600,
    className = "",
  }: VirtualizedProductsGridProps) => {
    const [scrollTop, setScrollTop] = React.useState(0);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const visibleItems = useMemo(() => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        products.length
      );

      return products.slice(startIndex, endIndex).map((product, index) => ({
        product,
        index: startIndex + index,
      }));
    }, [products, scrollTop, itemHeight, containerHeight]);

    const totalHeight = products.length * itemHeight;

    return (
      <div
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleItems.map(({ product, index }) => (
            <div
              key={product._id}
              style={{
                position: "absolute",
                top: index * itemHeight,
                height: itemHeight,
                width: "100%",
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

VirtualizedProductsGrid.displayName = "VirtualizedProductsGrid";

export default VirtualizedProductsGrid;
