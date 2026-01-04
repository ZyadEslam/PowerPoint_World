"use client";

import { useContext } from "react";
import { ShopProductsContext } from "../context/shopProductsCtx";

export const useShopProducts = () => {
  const context = useContext(ShopProductsContext);

  if (!context) {
    throw new Error(
      "useShopProducts must be used within a ShopProductsProvider"
    );
  }

  return context;
};
