"use client";
import { createContext } from "react";
import { ProductCardProps } from "@/app/types/types";

interface ShopProductsContextProps {
  // Initial products data (prefetched from server)
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
  // Current state
  currentProducts: ProductCardProps[];
  currentPagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  currentFilters: {
    brands: string[];
    priceRange: {
      min?: number;
      max?: number;
    };
  };
  isLoading: boolean;
  error: string | null;
  // Methods
  setCurrentProducts: React.Dispatch<React.SetStateAction<ProductCardProps[]>>;
  setCurrentPagination: React.Dispatch<
    React.SetStateAction<{
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }>
  >;
  setCurrentFilters: React.Dispatch<
    React.SetStateAction<{
      brands: string[];
      priceRange: {
        min?: number;
        max?: number;
      };
    }>
  >;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ShopProductsContext =
  createContext<ShopProductsContextProps | null>(null);
