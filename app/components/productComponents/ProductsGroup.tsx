"use client";
import React, { useEffect, useState, useContext, useMemo } from "react";
import ProductCard from "./ProductCard";
import { ProductCardProps } from "../../types/types";
import ErrorBox from "../../UI/ErrorBox";
import { ProductSkeletonGroup } from "./LoadingSkeleton";
import { ProductsContext } from "@/app/context/productsCtx";

const ProductsGroup = ({
  numOfProducts,
  customClassName,
}: {
  numOfProducts?: number;
  customClassName?: string;
}) => {
  const context = useContext(ProductsContext);
  const [filteredProducts, setFilteredProducts] = useState<ProductCardProps[]>(
    []
  );

  // Memoize products to avoid dependency issues
  const products = useMemo(() => context?.products || [], [context?.products]);
  const isLoading = context?.isLoading || false;
  const error = context?.error || null;
  const fetchProducts = context?.fetchProducts;

  useEffect(() => {
    // Trigger products fetch on demand when a consumer actually mounts
    if (products.length === 0 && fetchProducts) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  useEffect(() => {
    if (numOfProducts && products.length > 0) {
      setFilteredProducts(products.slice(0, numOfProducts));
    }
  }, [numOfProducts, products]);

  if (!context) {
    return (
      <ErrorBox errorMessage="Products context is not available. Please ensure ProductsProvider is set up." />
    );
  }

  if (isLoading) {
    return <ProductSkeletonGroup />;
  }

  if (error || !products || products.length === 0) {
    return (
      <ErrorBox
        errorMessage={
          error || "Error loading products: Please Wait and try again"
        }
      />
    );
  }

  const productsToRender = numOfProducts ? filteredProducts : products;

  return (
    <section className={`${customClassName}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
};

export default ProductsGroup;
