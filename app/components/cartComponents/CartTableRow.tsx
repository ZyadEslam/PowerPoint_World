"use client";
import React, { useCallback, useState, useEffect, memo } from "react";
import { TableRowProps } from "../../types/types";
import Link from "next/link";
import { useCart } from "@/app/hooks/useCart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

const CartTableRow = memo(({ product }: TableRowProps) => {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const tProduct = useTranslations("product");
  const [productPrice, setProductPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(product.quantityInCart || 1);
  const [imageError, setImageError] = useState(false);
  const { removeFromCart, updateQuantity } = useCart();
  const maxAvailable =
    product.maxAvailable ??
    product.variants?.find(
      (variant) => variant._id === product.selectedVariantId
    )?.quantity ??
    product.totalStock ??
    undefined;

  useEffect(() => {
    const newPrice = product.price * quantity;
    setProductPrice(newPrice);
  }, [quantity, product.price]);

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (newQuantity < 1) return;
      if (maxAvailable && newQuantity > maxAvailable) return;

      setQuantity(newQuantity);

      if (updateQuantity) {
        updateQuantity(
          product._id as string,
          product.selectedVariantId,
          newQuantity
        );
      }
    },
    [product._id, product.selectedVariantId, updateQuantity, maxAvailable]
  );

  const incrementQuantity = useCallback(() => {
    handleQuantityChange(quantity + 1);
  }, [quantity, handleQuantityChange]);

  const decrementQuantity = useCallback(() => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  }, [quantity, handleQuantityChange]);

  const removeFromCartHandler = useCallback(() => {
    removeFromCart(product._id as string, product.selectedVariantId);
  }, [product._id, product.selectedVariantId, removeFromCart]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-orange/20">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex gap-4 mb-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Link href={`/product/${product._id}`}>
              {!imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/product/image/${product._id}?index=0&w=80&h=80`}
                  width={80}
                  height={80}
                  alt={product.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </Link>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/product/${product._id}`}>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight hover:text-orange transition-colors duration-200 line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {productPrice.toFixed(2)} {tCommon("currency")}
            </p>
            {(product.selectedColor || product.selectedSize) && (
              <p className="text-xs text-gray-500 mt-1">
                {product.selectedColor && (
                  <span>
                    {tProduct("color")}: {product.selectedColor}
                  </span>
                )}
                {product.selectedColor && product.selectedSize && " · "}
                {product.selectedSize && (
                  <span>
                    {tProduct("size")}: {product.selectedSize}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={removeFromCartHandler}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                disabled={maxAvailable ? quantity >= maxAvailable : false}
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-12 gap-6 items-center">
        {/* Product Details */}
        <div className="col-span-6 flex items-center gap-4">
          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Link href={`/product/${product._id}`}>
              {!imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/product/image/${product._id}?index=0&w=64&h=64`}
                  width={64}
                  height={64}
                  alt={product.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <Link href={`/product/${product._id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-orange transition-colors duration-200 line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {product.price.toFixed(2)} {tCommon("currency")} {t("each")}
            </p>
            {(product.selectedColor || product.selectedSize) && (
              <p className="text-xs text-gray-500 mt-1">
                {product.selectedColor && (
                  <span>
                    {tProduct("color")}: {product.selectedColor}
                  </span>
                )}
                {product.selectedColor && product.selectedSize && " · "}
                {product.selectedSize && (
                  <span>
                    {tProduct("size")}: {product.selectedSize}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="col-span-2">
          <div className="flex items-center border border-gray-300 rounded-lg w-fit">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              disabled={maxAvailable ? quantity >= maxAvailable : false}
              className="p-2 hover:bg-gray-100 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Unit Price */}
        <div className="col-span-2">
          <p className="text-gray-600">
            {product.price.toFixed(2)} {tCommon("currency")}
          </p>
        </div>

        {/* Total Price & Actions */}
        <div className="col-span-2 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            {productPrice.toFixed(2)} {tCommon("currency")}
          </p>
          <button
            onClick={removeFromCartHandler}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

CartTableRow.displayName = "CartTableRow";

export default CartTableRow;
