"use client";
import { createContext } from "react";
import { ProductCardProps } from "@/app/types/types";

interface ProductsContextProps {
  products: ProductCardProps[];
  setProducts: React.Dispatch<React.SetStateAction<ProductCardProps[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  fetchProducts: () => Promise<void>;
}

export const ProductsContext = createContext<ProductsContextProps | null>(null);
