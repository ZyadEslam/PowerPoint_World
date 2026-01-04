"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ProductCardProps } from "@/app/types/types";
import { CartContext } from "../../context/cartCtx";
import { useSession } from "next-auth/react"; // If using NextAuth
import { api } from "@/app/utils/api";
import { uniqueListItems } from "@/app/utils/utilFunctions";

interface CartProviderProps {
  children: React.ReactNode;
}

// Storage keys
const getCartStorageKey = (userId?: string) => {
  return userId ? `cart-${userId}` : "cart-anonymous";
};

const CartProvider = ({ children }: CartProviderProps) => {
  const { data: session } = useSession();
  const [cart, setCart] = useState<ProductCardProps[]>([]);
  const [error, setError] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const hasSyncedRef = useRef(false);

  const matchCartItem = useCallback(
    (item: ProductCardProps, productId?: string, variantId?: string | null) =>
      item._id === productId &&
      (item.selectedVariantId || null) === (variantId || null),
    []
  );

  const resolveVariantQuantity = useCallback(
    (product: ProductCardProps): number | undefined => {
      if (product.maxAvailable !== undefined) {
        return product.maxAvailable;
      }
      if (product.selectedVariantId && product.variants?.length) {
        const variant = product.variants.find(
          (v) => v._id === product.selectedVariantId
        );
        if (variant) {
          return variant.quantity;
        }
      }
      return product.totalStock;
    },
    []
  );

  // Initialize cart from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsCartHydrated(false);

    try {
      const storageKey = getCartStorageKey(session?.user?.id);
      const storedCart = localStorage.getItem(storageKey);

      if (storedCart) {
        setCart(JSON.parse(storedCart));
      } else {
        // If user just logged in and no user cart exists, check for anonymous cart
        if (session?.user?.id) {
          const anonymousKey = getCartStorageKey();
          const anonymousCart = localStorage.getItem(anonymousKey);
          if (anonymousCart) {
            // Preserve anonymous cart temporarily - sync will merge it
            const parsedAnonymousCart = JSON.parse(anonymousCart);
            setCart(parsedAnonymousCart);
            // Don't remove anonymous cart yet - let sync handle merging
          } else {
            setCart([]);
          }
        } else {
          // Guest user - use anonymous cart
          const anonymousKey = getCartStorageKey();
          const anonymousCart = localStorage.getItem(anonymousKey);
          if (anonymousCart) {
            setCart(JSON.parse(anonymousCart));
          } else {
            setCart([]);
          }
        }
      }
    } catch {
      // Error handled silently for production
    } finally {
      setIsCartHydrated(true);
    }
  }, [session?.user?.id]);

  // Save to localStorage whenever cart or user changes
  useEffect(() => {
    if (typeof window === "undefined" || !isCartHydrated) return;

    try {
      const storageKey = getCartStorageKey(session?.user?.id);
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      // Error handled silently for production
    }
  }, [cart, session?.user?.id, isCartHydrated]);

  //This occurs when a user navigates away from a page, closes a tab, or refreshes the browser.
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session?.user?.id && cart.length > 0) {
        // Use navigator.sendBeacon for reliable sync during page unload
        const data = JSON.stringify({ cart });
        navigator.sendBeacon("/api/cart", data);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cart, session?.user?.id]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const total = cart.reduce((sum, item) => {
      return sum + item.price * (item.quantityInCart || 1);
    }, 0);
    setTotalPrice(Number(total.toFixed(2)));
  }, [cart]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  // Manual sync function (call this on signout)
  const manualSync = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const storageKey = getCartStorageKey(session.user.id);
        const storedCart = localStorage.getItem(storageKey);
        const localCart = storedCart ? JSON.parse(storedCart) : [];
        await api.mergeCart(localCart, session.user.id);
      } catch {
        // Error handled silently for production
      }
    }
  }, [session?.user?.id]);
  // Add to cart
  const addToCart = useCallback(
    (product: ProductCardProps) => {
      if (!product?._id) {
        return;
      }

      if (product.variants?.length && !product.selectedVariantId) {
        return;
      }

      setCart((prevCart) => {
        const variantId = product.selectedVariantId || null;
        const existingIndex = prevCart.findIndex((item) =>
          matchCartItem(item, product._id, variantId)
        );
        const quantityToAdd =
          product.quantityInCart && product.quantityInCart > 0
            ? product.quantityInCart
            : 1;
        const maxAvailable = resolveVariantQuantity(product);

        if (existingIndex !== -1) {
          return prevCart.map((item, idx) => {
            if (idx !== existingIndex) return item;
            const currentQty = item.quantityInCart || 1;
            const updatedQuantity = maxAvailable
              ? Math.min(currentQty + quantityToAdd, maxAvailable)
              : currentQty + quantityToAdd;

            return {
              ...item,
              quantityInCart: updatedQuantity,
              maxAvailable: maxAvailable ?? item.maxAvailable,
            };
          });
        }

        return [
          ...prevCart,
          {
            ...product,
            quantityInCart: maxAvailable
              ? Math.min(quantityToAdd, maxAvailable)
              : quantityToAdd,
            maxAvailable,
          },
        ];
      });
    },
    [matchCartItem, resolveVariantQuantity]
  );

  // Remove from cart
  const removeFromCart = useCallback(
    (productId: string, variantId?: string) => {
      setCart((prevCart) =>
        prevCart.filter(
          (item) => !matchCartItem(item, productId, variantId || null)
        )
      );
    },
    [matchCartItem]
  );

  // Update quantity
  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      if (quantity <= 0) {
        setCart((prevCart) =>
          prevCart.filter(
            (item) => !matchCartItem(item, productId, variantId || null)
          )
        );
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) => {
          if (!matchCartItem(item, productId, variantId || null)) {
            return item;
          }
          const maxAvailable =
            item.maxAvailable ?? resolveVariantQuantity(item);
          const clampedQuantity = maxAvailable
            ? Math.min(quantity, maxAvailable)
            : quantity;
          return { ...item, quantityInCart: clampedQuantity, maxAvailable };
        })
      );
    },
    [matchCartItem, resolveVariantQuantity]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    // Clear cart state first
    setCart([]);
    // Also clear localStorage immediately - do this synchronously before any useEffect runs
    if (typeof window !== "undefined") {
      const storageKey = getCartStorageKey(session?.user?.id);
      // Clear all possible cart storage keys
      localStorage.removeItem(storageKey);
      localStorage.removeItem("cart-anonymous");
      localStorage.removeItem("cart");
      // Set empty array to ensure it's cleared
      localStorage.setItem(storageKey, JSON.stringify([]));
      localStorage.setItem("cart", JSON.stringify([]));
      // Keep sync flag as true to prevent reloading from server after manual clear
      // (Only reset on user change, not on manual clear)
    }
  }, [session?.user?.id]);

  const removeUserCart = useCallback(() => {
    if (typeof window === "undefined") return;
    if (session?.user?.id) {
      const storageKey = getCartStorageKey(session.user.id);
      localStorage.removeItem(storageKey);
      setCart([]);
    }
  }, [session?.user?.id]);

  // Get cart item count
  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => total + (item.quantityInCart || 1), 0);
  }, [cart]);

  // Check if product is in cart
  const isInCart = useCallback(
    (productId: string, variantId?: string) => {
      if (!variantId) {
        return cart.some((item) => item._id === productId);
      }

      return cart.some((item) =>
        matchCartItem(item, productId, variantId || null)
      );
    },
    [cart, matchCartItem]
  );

  // Sync with server database on component mount (only when user ID changes)
  useEffect(() => {
    // Don't sync for guest users
    if (!session?.user?.id) {
      // Clear any error state for guest users
      setError("");
      return;
    }

    // Prevent multiple syncs for the same user
    if (hasSyncedRef.current) {
      return;
    }

    // Don't sync until cart is hydrated
    if (!isCartHydrated) {
      return;
    }

    const syncCartWithServer = async () => {
      if (session?.user?.id && typeof window !== "undefined") {
        try {
          hasSyncedRef.current = true;
          const anonymousKey = getCartStorageKey();
          const userKey = getCartStorageKey(session.user.id);

          // Get carts from localStorage (source of truth)
          const anonymousCart = localStorage.getItem(anonymousKey);
          const userCart = localStorage.getItem(userKey);

          // Fetch server cart - handle errors gracefully
          let serverCart: ProductCardProps[] = [];
          try {
            const cartResponse = await api.getCart(session.user.id as string);
            serverCart = cartResponse.cart || [];
          } catch {
            // If fetch fails, use local cart as fallback
            // If we have a local cart, use it
            if (userCart) {
              const parsedUserCart = JSON.parse(userCart);
              if (parsedUserCart.length > 0) {
                setCart(parsedUserCart);
                return; // Exit early, don't try to sync
              }
            }

            // If we have anonymous cart and no user cart, preserve it
            if (anonymousCart && !userCart) {
              const parsedAnonymousCart = JSON.parse(anonymousCart);
              setCart(parsedAnonymousCart);
              localStorage.setItem(userKey, anonymousCart);
              // Don't remove anonymous cart yet - will sync later when server is available
            }

            // Don't set error state for network issues - user can still use local cart
            hasSyncedRef.current = false; // Allow retry
            return;
          }

          // Clear any previous errors on successful sync attempt
          setError("");

          // Merge logic: prioritize preserving guest cart items
          let mergedCart: ProductCardProps[] = [];

          if (anonymousCart && !userCart) {
            // User just logged in - merge anonymous cart with server cart
            const parsedAnonymousCart = JSON.parse(anonymousCart);
            if (serverCart.length > 0) {
              // Merge both carts, removing duplicates
              mergedCart = uniqueListItems([
                ...parsedAnonymousCart,
                ...serverCart,
              ]);
            } else {
              // No server cart, use anonymous cart
              mergedCart = parsedAnonymousCart;
            }

            // Update state and localStorage
            setCart(mergedCart);
            localStorage.setItem(userKey, JSON.stringify(mergedCart));

            // Sync to server (don't await - fire and forget)
            if (mergedCart.length > 0) {
              api.mergeCart(mergedCart, session.user.id).catch(() => {
                // Don't show error - cart is saved locally
              });
            }

            // Remove anonymous cart after successful merge
            localStorage.removeItem(anonymousKey);
          } else if (userCart) {
            // User cart exists - merge with server cart
            const parsedUserCart = JSON.parse(userCart);
            if (parsedUserCart.length > 0) {
              // Merge local with server
              mergedCart = uniqueListItems([...parsedUserCart, ...serverCart]);
              setCart(mergedCart);
              localStorage.setItem(userKey, JSON.stringify(mergedCart));

              // Sync to server if there are changes (don't await)
              if (
                mergedCart.length > 0 &&
                JSON.stringify(mergedCart) !== JSON.stringify(serverCart)
              ) {
                api.mergeCart(mergedCart, session.user.id).catch((err) => {
                  console.warn("Failed to sync cart to server:", err);
                  // Don't show error - cart is saved locally
                });
              }
            } else if (serverCart.length > 0) {
              // Local is empty but server has items - use server
              setCart(serverCart);
              localStorage.setItem(userKey, JSON.stringify(serverCart));
            }
          } else if (serverCart.length > 0) {
            // Only server has items
            setCart(serverCart);
            localStorage.setItem(userKey, JSON.stringify(serverCart));
          }
        } catch {
          // Don't set error state - let user continue with local cart
          hasSyncedRef.current = false; // Allow retry on error
        }
      }
    };

    syncCartWithServer();
    // Only sync when user ID or hydration status changes
  }, [session?.user?.id, isCartHydrated]);

  // Reset sync flag when user changes
  useEffect(() => {
    hasSyncedRef.current = false;
  }, [session?.user?.id]);

  const contextValue = useMemo(
    () => ({
      cart,
      totalPrice,
      error,
      calculateTotals,
      setCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItemCount,
      isInCart,
      manualSync,
      removeUserCart,
    }),
    [
      cart,
      totalPrice,
      error,
      calculateTotals,
      addToCart,
      getCartItemCount,
      isInCart,
      manualSync,
      removeUserCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export default CartProvider;
