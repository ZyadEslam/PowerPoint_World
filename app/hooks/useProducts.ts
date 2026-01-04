import { useState, useCallback, useRef } from "react";
import { cachedFetchJson, cacheStrategies } from "@/app/utils/cachedFetch";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  brand: string;
  category: string;
  categoryName: string;
  imageCount?: number;
  hideFromHome?: boolean;
  variants?: ProductVariant[];
  totalStock?: number;
}

export interface ProductVariant {
  _id: string;
  color: string;
  size: string;
  quantity: number;
  sku?: string;
}

export interface ProductFormVariant {
  _id?: string;
  color: string;
  size: string;
  quantity: string;
  sku?: string;
  clientId?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  discount: string;
  rating: string;
  brand: string;
  category: string;
  categoryName: string;
  hideFromHome?: boolean;
  variants: ProductFormVariant[];
}

interface UseProductsReturn {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  success: string | null;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  updateProduct: (id: string, data: ProductFormData) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fetchingRef = useRef(false); // Prevent concurrent fetches

  const fetchProducts = useCallback(async (force = false) => {
    // Prevent concurrent fetches unless forced
    if (fetchingRef.current && !force) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      // Use cached fetch with appropriate cache strategy
      const data = await cachedFetchJson<{
        products: Product[];
        success: boolean;
      }>("/api/product", cacheStrategies.products(force));

      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await cachedFetchJson<{
        data: Category[];
        success: boolean;
      }>("/api/categories", cacheStrategies.categories());
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, formData: ProductFormData): Promise<boolean> => {
      try {
        setError(null);
        setSuccess(null);

        const normalizedVariants =
          formData.variants
            ?.filter((variant) => variant.color && variant.size)
            .map((variant) => {
              const sanitized = { ...variant };
              delete sanitized.clientId;
              return {
                _id: sanitized._id || `temp-${Date.now()}-${Math.random()}`, // Temporary ID for new variants
                color: sanitized.color?.trim() || "",
                size: sanitized.size?.trim() || "",
                quantity:
                  Number(sanitized.quantity) > 0
                    ? Number(sanitized.quantity)
                    : 0,
                ...(sanitized.sku && { sku: sanitized.sku.trim() }),
              };
            }) || [];

        const updateData = {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          ...(formData.oldPrice && { oldPrice: Number(formData.oldPrice) }),
          ...(formData.discount && { discount: Number(formData.discount) }),
          rating: Number(formData.rating),
          brand: formData.brand,
          category: formData.category,
          categoryName: formData.categoryName,
          hideFromHome: formData.hideFromHome ?? false,
          variants: normalizedVariants,
          totalStock: normalizedVariants.reduce(
            (sum, variant) => sum + (variant.quantity || 0),
            0
          ),
        };

        // Optimistic update - update local state immediately
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === id
              ? {
                  ...product,
                  ...updateData,
                  imageCount: product.imageCount, // Preserve image count
                }
              : product
          )
        );

        const response = await fetch(`/api/product/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (!response.ok) {
          // Revert optimistic update on error
          await fetchProducts(true);
          throw new Error(result.message || "Failed to update product");
        }

        setSuccess("Product updated successfully");
        // Optionally refetch to ensure data consistency (but only if needed)
        // For now, we'll skip the refetch since we already updated optimistically
        setTimeout(() => setSuccess(null), 3000);
        return true;
      } catch (err) {
        // Revert optimistic update on error
        await fetchProducts(true);
        setError(
          err instanceof Error ? err.message : "Failed to update product"
        );
        return false;
      }
    },
    [fetchProducts]
  );

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      // Optimistic update - remove from local state immediately
      let deletedProduct: Product | undefined;
      setProducts((prevProducts) => {
        deletedProduct = prevProducts.find((p) => p._id === id);
        return prevProducts.filter((product) => product._id !== id);
      });

      const response = await fetch(`/api/product/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        // Revert optimistic update on error
        if (deletedProduct) {
          setProducts((prevProducts) => [...prevProducts, deletedProduct!]);
        }
        throw new Error(result.message || "Failed to delete product");
      }

      setSuccess("Product deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      return false;
    }
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    success,
    fetchProducts,
    fetchCategories,
    updateProduct,
    deleteProduct,
    setError,
    setSuccess,
  };
};
