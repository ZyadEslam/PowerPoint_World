"use client";
import { useState, useMemo } from "react";
import { ProductCardProps } from "@/app/types/types";
import { ShopProductsContext } from "@/app/context/shopProductsCtx";

interface ShopProductsProviderProps {
  children: React.ReactNode;
  initialProducts: ProductCardProps[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  initialFilters: {
    brands: string[];
    priceRange: {
      min?: number;
      max?: number;
    };
  };
}

const ShopProductsProvider = ({
  children,
  initialProducts,
  initialPagination,
  initialFilters,
}: ShopProductsProviderProps) => {
  const [currentProducts, setCurrentProducts] =
    useState<ProductCardProps[]>(initialProducts);
  const [currentPagination, setCurrentPagination] = useState(initialPagination);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextValue = useMemo(
    () => ({
      initialProducts,
      initialPagination,
      initialFilters,
      currentProducts,
      currentPagination,
      currentFilters,
      isLoading,
      error,
      setCurrentProducts,
      setCurrentPagination,
      setCurrentFilters,
      setIsLoading,
      setError,
    }),
    [
      initialProducts,
      initialPagination,
      initialFilters,
      currentProducts,
      currentPagination,
      currentFilters,
      isLoading,
      error,
    ]
  );

  return (
    <ShopProductsContext.Provider value={contextValue}>
      {children}
    </ShopProductsContext.Provider>
  );
};

export default ShopProductsProvider;
