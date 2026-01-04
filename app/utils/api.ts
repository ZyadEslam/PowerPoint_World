import { NextResponse } from "next/server";
import { ProductCardProps } from "../types/types";
import { cachedFetchJson, cacheStrategies } from "./cachedFetch";

export function getBaseUrl(): string {
  // Always use relative URLs - works for both client and server
  // Next.js handles relative URLs correctly in server components
  // This avoids Vercel deployment protection issues
  return "";
}

const API_BASE_URL = "/api";

/**
 * Client-side API functions that use HTTP requests
 * For server-side usage, use serverApi.ts functions instead
 */
export const api = {
  getProducts: async (): Promise<ProductCardProps[]> => {
    // Check if we're in a server environment
    if (typeof window === "undefined") {
      // Import server-side function dynamically
      const { getAllProducts } = await import("./serverApi");
      return getAllProducts();
    }

    // Client-side: use HTTP request
    try {
      const data = await cachedFetchJson<{ products: ProductCardProps[] }>(
        `${API_BASE_URL}/product`,
        cacheStrategies.products()
      );

      return data.products || [];
    } catch {
      // Return empty array on error instead of the error object
      return [];
    }
  },
  getProduct: async (id: string): Promise<ProductCardProps> => {
    // Check if we're in a server environment
    if (typeof window === "undefined") {
      // Import server-side function dynamically
      const { getProductById } = await import("./serverApi");
      const product = await getProductById(id);
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    }

    // Client-side: use HTTP request with relative URL
    try {
      const url = `${API_BASE_URL}/product/${id}`;

      const data = await cachedFetchJson<{ product: ProductCardProps }>(
        url,
        cacheStrategies.products()
      );

      if (!data || !data.product) {
        throw new Error("Product not found");
      }

      return data.product;
    } catch (error) {

      // Provide more detailed error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Failed to fetch product. Please check your database connection and API configuration.";

      throw new Error(errorMessage);
    }
  },
  getUser: async (id: string) => {
    try {
      const user = await cachedFetchJson(
        `${API_BASE_URL}/user/${id}`,
        cacheStrategies.userData()
      );
      return user;
    } catch {
      return null;
    }
  },
  getCart: async (userId: string): Promise<{ cart: ProductCardProps[] }> => {
    try {
      const res = await cachedFetchJson<{ cart: ProductCardProps[] }>(
        `${API_BASE_URL}/user/${userId}/cart`,
        cacheStrategies.userData()
      );
      return res;
    } catch {
      // Return empty cart on error instead of NextResponse
      return { cart: [] };
    }
  },
  mergeCart: async (
    cartToAdd: ProductCardProps[],
    userId: string | undefined
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartToAdd,
        }),
      });
      await response.json();
      return response.json();
    } catch (err) {
      return NextResponse.json(err, { status: 401 });
    }
  },
  clearCart: async (userId: string | undefined) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartToAdd: [] }),
      });
      return response.json();
    } catch (err) {
      return NextResponse.json(err, { status: 401 });
    }
  },
};
