"use client";

import { ProductCardProps } from "../types/types";
import { 
  getBaseUrl } from "./api";

export const addToCartStorage = (
  product: ProductCardProps,
  quantity: number = 1
): ProductCardProps[] | string => {
  const cart = JSON.parse(localStorage.getItem("cart") as string);
  if (cart) {
    const itemToAdd = cart.find(
      (item: ProductCardProps) => item._id === product._id
    ) as ProductCardProps;

    if (!itemToAdd) {
      const productWithQuantity = { ...product, quantityInCart: quantity };
      cart.push(productWithQuantity);
      localStorage.setItem("cart", JSON.stringify(cart));
      return cart;
    } else {
      return "Item Already in the Cart";
    }
  } else {
    const productWithQuantity = { ...product, quantityInCart: quantity };
    const cart = [productWithQuantity];
    localStorage.setItem("cart", JSON.stringify(cart));
    return cart;
  }
};

export const removeFromCartStorage = (
  productId: string
): ProductCardProps[] | string => {
  const cart = JSON.parse(localStorage.getItem("cart") as string);
  if (cart) {
    const itemToRemove = cart.find(
      (item: ProductCardProps) => item._id === productId
    );
    if (!itemToRemove) {
      return "Item is not in the Cart";
    } else {
      const filteredCart = cart.filter(
        (item: ProductCardProps) => item._id !== productId
      );
      localStorage.setItem("cart", JSON.stringify(filteredCart));
      return filteredCart;
    }
  } else {
    localStorage.setItem("cart", JSON.stringify([]));
    return [];
  }
};

export const isInCartStorage = (id: string): boolean => {
  const cart = JSON.parse(localStorage.getItem("cart") as string);
  if (cart && Array.isArray(cart)) {
    return JSON.parse(localStorage.getItem("cart") as string).some(
      (item: ProductCardProps) => item._id === id
    );
  } else {
    localStorage.setItem("cart", JSON.stringify([]));
    return false;
  }
};

export const clearCartStorage = () => {
  localStorage.removeItem("cart");
};

export const mergeCartWithDB = (
  localStorageCart: ProductCardProps[],
  dbCart: ProductCardProps[]
): ProductCardProps[] => {
  // Handle edge cases
  if (!Array.isArray(localStorageCart)) localStorageCart = [];
  if (!Array.isArray(dbCart)) dbCart = [];

  const mergedCart = [...dbCart];

  localStorageCart.forEach((localItem) => {
    if (!localItem || !localItem._id) return; // Skip invalid items

    // Check if item already exists in the merged cart
    const existingItem = mergedCart.find((item) => item._id === localItem._id);

    // If item doesn't exist in merged cart, add it
    if (!existingItem) {
      mergedCart.push(localItem);
    }
    ////////////////////////////////// To Do ////////////////////////////////////////
          // The dashboard does not appear in the mobile's menue
    ////////////////////////////////////////////////////////////////////////////////
  });

  return mergedCart;
};

export const syncCartOnLogin = async (userId: string) => {
  try {
    // Get cart from DB
    const response = await fetch(`${getBaseUrl()}/api/user/${userId}/cart`);
    const { cart: dbCart } = await response.json();

    // Get cart from localStorage
    const localStorageCart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart") as string)
      : [];

    // Merge carts (no duplicates)
    const mergedCart = mergeCartWithDB(localStorageCart, dbCart);

    // Update localStorage with merged cart
    localStorage.setItem("cart", JSON.stringify(mergedCart));

    console.log("Cart synced on login:", mergedCart);
    return mergedCart;
  } catch (error) {
    console.error("Error syncing cart on login:", error);
    return [];
  }
};


export const uniqueListItems = (list: ProductCardProps[]) => {
  return Array.from(new Map(list.map((item) => [item._id, item])).values());
};

/**
 * Calculate delivery cost based on city
 * @param city - The city name (cairo, giza, or other)
 * @param cairoGizaDeliveryCost - Delivery cost for Cairo and Giza
 * @param otherCitiesDeliveryCost - Delivery cost for other cities
 * @returns The delivery cost for the given city
 */
export const calculateDeliveryCost = (
  city: string | undefined | null,
  cairoGizaDeliveryCost: number,
  otherCitiesDeliveryCost: number
): number => {
  if (!city) return 0;
  
  const normalizedCity = city.toLowerCase().trim();
  
  if (normalizedCity === "cairo" || normalizedCity === "giza") {
    return cairoGizaDeliveryCost;
  }
  
  return otherCitiesDeliveryCost;
};