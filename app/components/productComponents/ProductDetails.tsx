"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RatingStars from "../RatingStars";
import Toast from "../../UI/Toast";
import { ProductCardProps } from "../../types/types";
import { Plus, Minus, ShoppingCart, Check, Loader2, Zap } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { useCart } from "../../hooks/useCart";

const ProductDetails = ({ data }: { data: ProductCardProps }) => {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const [showToast, setShowToast] = useState({ show: false, message: "" });
  const [isAdding, setIsAdding] = useState(false);

  // Product options state
  const variants = useMemo(() => data.variants || [], [data.variants]);
  const hasVariants = variants.length > 0;
  const [selectedColor, setSelectedColor] = useState<string>(
    variants[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    variants[0]?.size || ""
  );
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (hasVariants && variants.length > 0) {
      setSelectedColor(variants[0].color);
      setSelectedSize(variants[0].size);
      setQuantity(variants[0].quantity > 0 ? 1 : 0);
    } else {
      setSelectedColor("");
      setSelectedSize("");
      setQuantity(1);
    }
  }, [data._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const colorOptions = useMemo(() => {
    const map = new Map<string, number>();
    variants.forEach((variant) => {
      if (!map.has(variant.color)) {
        map.set(variant.color, 0);
      }
      map.set(variant.color, map.get(variant.color)! + variant.quantity);
    });
    return Array.from(map.entries()).map(([color, qty]) => ({
      color,
      total: qty,
    }));
  }, [variants]);

  const sizeOptions = useMemo(() => {
    if (!selectedColor) {
      return Array.from(new Set(variants.map((variant) => variant.size))).map(
        (size) => ({
          size,
          available: variants
            .filter((v) => v.size === size)
            .reduce((sum, v) => sum + v.quantity, 0),
        })
      );
    }

    const filtered = variants.filter(
      (variant) => variant.color === selectedColor
    );
    return filtered.map((variant) => ({
      size: variant.size,
      available: variant.quantity,
    }));
  }, [variants, selectedColor]);

  const selectedVariant = hasVariants
    ? variants.find(
        (variant) =>
          variant.color === selectedColor && variant.size === selectedSize
      )
    : undefined;

  const availableQuantity = hasVariants
    ? selectedVariant?.quantity ?? 0
    : data.totalStock ?? 0;

  const handleShowToast = (showState: boolean, message: string) => {
    setShowToast({
      show: showState,
      message: message,
    });
  };

  const listHandler = async (handlerType: string) => {
    if (handlerType !== "cart") return;

    setIsAdding(true);

    // Small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (hasVariants) {
      if (!selectedVariant) {
        setIsAdding(false);
        return;
      }
      const inCart = isInCart(data._id as string, selectedVariant._id);

      if (!inCart) {
        addToCart({
          ...data,
          selectedVariantId: selectedVariant._id,
          selectedColor: selectedVariant.color,
          selectedSize: selectedVariant.size,
          maxAvailable: selectedVariant.quantity,
          variantSku: selectedVariant.sku,
          quantityInCart: quantity,
        });
        handleShowToast(true, t("addedToCart"));
        setIsAdding(false);

        // Wait 2 seconds then redirect to cart
        setTimeout(() => {
          router.push(`/${locale}/cart`);
        }, 2000);
        return;
      } else {
        removeFromCart(data._id as string, selectedVariant._id);
        handleShowToast(true, t("removedFromCart"));
      }
      setIsAdding(false);
      return;
    }

    // No variants defined, fallback to simple cart behavior
    if (!isInCart(data._id as string)) {
      addToCart({
        ...data,
        quantityInCart: quantity,
        maxAvailable: data.totalStock,
      });
      handleShowToast(true, t("addedToCart"));
      setIsAdding(false);

      // Wait 2 seconds then redirect to cart
      setTimeout(() => {
        router.push(`/${locale}/cart`);
      }, 2000);
      return;
    } else {
      removeFromCart(data._id as string);
      handleShowToast(true, t("removedFromCart"));
    }
    setIsAdding(false);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (availableQuantity && newQuantity > availableQuantity) return;
    setQuantity(newQuantity);
  };

  const handleBuyNow = () => {
    if (isAddToCartDisabled) return;

    // Validate stock before proceeding
    if (hasVariants && selectedVariant) {
      if (selectedVariant.quantity < quantity) {
        handleShowToast(
          true,
          t("insufficientStock", {
            available: selectedVariant.quantity,
            requested: quantity,
          }) ||
            `Insufficient stock. Available: ${selectedVariant.quantity}, Requested: ${quantity}`
        );
        return;
      }
    } else if (data.totalStock !== undefined && data.totalStock < quantity) {
      handleShowToast(
        true,
        t("insufficientStock", {
          available: data.totalStock,
          requested: quantity,
        }) ||
          `Insufficient stock. Available: ${data.totalStock}, Requested: ${quantity}`
      );
      return;
    }

    // Prepare product data for checkout
    let productData: ProductCardProps = {
      ...data,
      quantityInCart: quantity,
    };

    if (hasVariants && selectedVariant) {
      productData = {
        ...productData,
        selectedVariantId: selectedVariant._id,
        selectedColor: selectedVariant.color,
        selectedSize: selectedVariant.size,
        maxAvailable: selectedVariant.quantity,
        variantSku: selectedVariant.sku,
      };
    } else {
      productData = {
        ...productData,
        maxAvailable: data.totalStock,
      };
    }

    // Calculate subtotal
    const subtotal = (data.price || 0) * quantity;

    // Store in sessionStorage
    const checkoutData = {
      products: [productData],
      source: "buy_now",
      subtotal: subtotal,
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    // Redirect to checkout
    router.push(`/${locale}/checkout`);
  };

  useEffect(() => {
    if (!hasVariants) return;
    if (!selectedVariant) {
      setQuantity(1);
      return;
    }
    if (selectedVariant.quantity === 0) {
      setQuantity(0);
      return;
    }
    setQuantity((prev) =>
      prev < 1 ? 1 : Math.min(prev, selectedVariant.quantity)
    );
  }, [selectedVariant, hasVariants]);

  const isAddToCartDisabled = hasVariants
    ? !selectedVariant || selectedVariant.quantity === 0 || quantity === 0
    : quantity === 0;

  return (
    <div className="w-full md:w-1/2 mt-6 md:mt-0">
      <h1 className="sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">
        {data.name}
      </h1>

      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <RatingStars rating={data.rating} />
        <span className="text-xs sm:text-sm text-gray-600">{data.rating}</span>
      </div>

      <p className="md:text-[15px] sm:text-sm text-gray-600 mb-3 sm:mb-4">
        {data.description}
      </p>

      <p className="text-xl sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">
        {data.price} {tCommon("currency")}
        {data.oldPrice && (
          <span className="text-gray-400 font-normal text-sm ml-2 line-through">
            {data.oldPrice} {tCommon("currency")}
          </span>
        )}
      </p>

      <hr className="my-4 sm:my-5 md:my-6 border-gray-200" />

      {variants.length > 0 && (
        <>
          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {t("color")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.color}
                  onClick={() => {
                    setSelectedColor(color.color);
                    const sizeForColor = variants.find(
                      (variant) =>
                        variant.color === color.color &&
                        variant.size === selectedSize
                    );
                    if (!sizeForColor) {
                      const firstSize = variants.find(
                        (variant) => variant.color === color.color
                      );
                      setSelectedSize(firstSize?.size || "");
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    selectedColor === color.color
                      ? "bg-secondary text-white border-secondary"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange hover:text-orange"
                  }`}
                >
                  {color.color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {t("size")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((option) => (
                <button
                  key={`${option.size}-${option.available}`}
                  onClick={() => setSelectedSize(option.size)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    selectedSize === option.size
                      ? "bg-secondary text-white border-orange"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange hover:text-orange"
                  } ${
                    option.available === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={option.available === 0}
                >
                  {option.size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Display for Selected Combination */}
          {selectedVariant && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {t("stockAvailability") || "Stock Availability"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedColor} • {selectedSize}
                  </p>
                </div>
                <div className="text-right">
                  {selectedVariant.quantity > 0 ? (
                    <span className="text-lg font-bold text-green-600">
                      {selectedVariant.quantity} {t("inStock") || "in stock"}
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-red-600">
                      {t("outOfStock") || "Out of stock"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quantity Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {t("quantity")}
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-semibold text-lg">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={
              quantity >= 10 ||
              (availableQuantity ? quantity >= availableQuantity : false)
            }
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {!hasVariants && data.totalStock !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            {data.totalStock > 0
              ? `${data.totalStock} ${t("itemsAvailable") || "items available"}`
              : t("outOfStock") || "Out of stock"}
          </p>
        )}
      </div>

      <div className="md:space-y-1 text-[14px] sm:space-y-3 mb-4 sm:mb-6">
        <div className="flex">
          <span className="w-20 text-gray-600 sm:w-24 font-medium">
            {t("brand")}:
          </span>
          <span className="text-gray-400">{data.brand}</span>
        </div>
        <div className="flex">
          <span className="w-20 text-gray-600 sm:w-24 font-medium">
            {t("color")}:
          </span>
          <span className="text-gray-400">{data.color}</span>
        </div>
        <div className="flex">
          <span className="w-20 text-gray-600 sm:w-24 font-medium">
            {t("category")}:
          </span>
          <span className="text-gray-400">{data.category}</span>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
        <button
          className={`group relative w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${
            isAddToCartDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none hover:shadow-none"
              : hasVariants
              ? selectedVariant &&
                isInCart(data._id as string, selectedVariant._id)
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-orange to-orange/90 text-white hover:from-orange/90 hover:to-orange"
              : isInCart(data._id as string)
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
              : "bg-gradient-to-r from-orange to-orange/90 text-white hover:from-orange/90 hover:to-orange"
          }`}
          onClick={() => {
            listHandler("cart");
          }}
          disabled={isAddToCartDisabled || isAdding}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t("adding")}</span>
            </>
          ) : hasVariants ? (
            selectedVariant &&
            isInCart(data._id as string, selectedVariant._id) ? (
              <>
                <Check className="w-5 h-5" />
                <span>{t("removeFromCart")}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>{t("addToCart")}</span>
              </>
            )
          ) : isInCart(data._id as string) ? (
            <>
              <Check className="w-5 h-5" />
              <span>{t("removeFromCart")}</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              <span>{t("addToCart")}</span>
            </>
          )}
        </button>
        <button
          className={`group relative w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${
            isAddToCartDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none hover:shadow-none"
              : "bg-gradient-to-r from-secondary to-secondary/90 text-white hover:from-secondary/90 hover:to-secondary"
          }`}
          onClick={handleBuyNow}
          disabled={isAddToCartDisabled}
        >
          <Zap className="w-5 h-5" />
          <span>{tCommon("buyNow")}</span>
        </button>
      </div>

      {/* Selection Summary */}
      {(selectedSize || selectedColor) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            {t("selectedOptions")}:
          </h4>
          <div className="text-sm text-gray-600">
            {selectedSize && (
              <p>
                {t("size")}: {selectedSize}
              </p>
            )}
            {selectedColor && (
              <p>
                {t("color")}: {selectedColor}
              </p>
            )}
            <p>
              {t("quantity")}: {quantity}
            </p>
          </div>
        </div>
      )}

      {showToast.show && (
        <Toast
          key={showToast.message}
          state={showToast.message.includes("Added") ? "success" : "fail"}
          message={showToast.message}
          autoHide={true}
          duration={3000}
        />
      )}
    </div>
  );
};

export default ProductDetails;
