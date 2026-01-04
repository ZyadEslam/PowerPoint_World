"use client";
import { useState, useMemo, useCallback } from "react";
import { ProductCardProps } from "@/app/types/types";
import { api } from "@/app/utils/api";
import { ProductsContext } from "@/app/context/productsCtx";

interface ProductsProviderProps {
  children: React.ReactNode;
}

const ProductsProvider = ({ children }: ProductsProviderProps) => {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (typeof window === "undefined") return;
    // Avoid refetching if we already have products or are currently loading
    if (isLoading || products.length > 0) return;

    try {
      setIsLoading(true);
      const serverProducts = await api.getProducts();
      setProducts(serverProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(
        error instanceof Error ? error.message : "Error Fetching Products"
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, products.length]);

  const contextValue = useMemo(
    () => ({
      products,
      isLoading,
      error,
      setProducts,
      setIsLoading,
      setError,
      fetchProducts,
    }),
    [products, isLoading, error, fetchProducts]
  );

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsProvider;
