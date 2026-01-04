"use client";
import { createContext } from "react";
import { ProductCardProps } from "@/app/types/types";

export interface CartContextProps {
  cart: ProductCardProps[];
  totalPrice: number;
  error: string;
  calculateTotals: () => void; // Changed: no parameters needed
  setCart: React.Dispatch<React.SetStateAction<ProductCardProps[]>>;
  addToCart: (product: ProductCardProps) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  isInCart: (productId: string, variantId?: string) => boolean;
  manualSync: () => Promise<void>;
  removeUserCart: () => void;
}

export const CartContext = createContext<CartContextProps | null>(null);
