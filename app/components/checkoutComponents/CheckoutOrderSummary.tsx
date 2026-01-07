"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ProductCardProps, CityCategory } from "@/app/types/types";
import { X } from "lucide-react";

interface CheckoutOrderSummaryProps {
  products: ProductCardProps[];
  subtotal: number;
  cityCategory?: CityCategory;
  onPromoCodeChange?: (
    promoCode: string | null,
    discountAmount: number,
    discountPercentage: number
  ) => void;
  onShippingFeeChange?: (fee: number) => void;
}

const CheckoutOrderSummary = ({
  products,
  subtotal,
  cityCategory,
  onPromoCodeChange,
  onShippingFeeChange,
}: CheckoutOrderSummaryProps) => {
  const tCheckout = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tCommon = useTranslations("common");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [cairoGizaFee, setCairoGizaFee] = useState<number>(0);
  const [otherCitiesFee, setOtherCitiesFee] = useState<number>(0);

  // Fetch shipping fees on component mount
  useEffect(() => {
    const fetchShippingFees = async () => {
      try {
        const response = await fetch("/api/settings");
        const result = await response.json();
        if (result.success) {
          setCairoGizaFee(result.cairoGizaShippingFee || 0);
          setOtherCitiesFee(result.otherCitiesShippingFee || 0);
        }
      } catch (error) {
        console.error("Error fetching shipping fees:", error);
        setCairoGizaFee(0);
        setOtherCitiesFee(0);
      }
    };
    fetchShippingFees();
  }, []);

  // Calculate shipping fee based on city category
  useEffect(() => {
    let fee = 0;
    if (cityCategory === "cairo" || cityCategory === "giza") {
      fee = cairoGizaFee;
    } else if (cityCategory === "other") {
      fee = otherCitiesFee;
    } else {
      // Default to Cairo/Giza fee if no city selected
      fee = cairoGizaFee;
    }
    setShippingFee(fee);
    if (onShippingFeeChange) {
      onShippingFeeChange(fee);
    }
  }, [cityCategory, cairoGizaFee, otherCitiesFee, onShippingFeeChange]);

  // Recalculate discount when subtotal or percentage changes
  useEffect(() => {
    if (discountPercentage > 0) {
      const newDiscount = (subtotal * discountPercentage) / 100;
      setDiscountAmount(newDiscount);
      if (onPromoCodeChange) {
        onPromoCodeChange(appliedPromoCode, newDiscount, discountPercentage);
      }
    } else {
      setDiscountAmount(0);
      if (onPromoCodeChange) {
        onPromoCodeChange(null, 0, 0);
      }
    }
  }, [subtotal, discountPercentage, appliedPromoCode, onPromoCodeChange]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError(tCart("promoRequired"));
      return;
    }

    setValidatingPromo(true);
    setPromoError("");

    try {
      const response = await fetch("/api/promo-code/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: promoCode.trim() }),
      });

      const result = await response.json();

      if (result.valid) {
        const normalizedCode = promoCode.toUpperCase().trim();
        setAppliedPromoCode(normalizedCode);
        setDiscountPercentage(result.discountPercentage);
        const discount = (subtotal * result.discountPercentage) / 100;
        setDiscountAmount(discount);
        setPromoError("");
      } else {
        setPromoError(result.error || tCart("promoInvalid"));
        setAppliedPromoCode(null);
        setDiscountPercentage(0);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError(tCart("promoValidateError"));
      setAppliedPromoCode(null);
      setDiscountPercentage(0);
      setDiscountAmount(0);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode("");
    setAppliedPromoCode(null);
    setDiscountPercentage(0);
    setDiscountAmount(0);
    setPromoError("");
  };

  const totalItems = useMemo(() => {
    return products.reduce(
      (total, item) => total + (item.quantityInCart || 1),
      0
    );
  }, [products]);

  const totalPrice = useMemo(() => {
    const discountedPrice = Math.max(subtotal - discountAmount, 0);
    return discountedPrice + shippingFee;
  }, [subtotal, discountAmount, shippingFee]);

  return (
    <div className="bg-black rounded-2xl shadow-sm border border-gray-800 overflow-hidden sticky top-8">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {tCheckout("orderSummary")}
        </h2>

        {/* Product List */}
        <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
          {products.map((product, index) => {
            const quantity = product.quantityInCart || 1;
            const productTotal = (product.price || 0) * quantity;
            return (
              <div key={product._id || index} className="flex gap-3">
                <div className="relative w-16 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                  {product._id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/product/image/${product._id}?index=0&w=64&h=64`}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-[#C9C9C9] text-xs">
                              ${tCommon("noImage")}
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C9C9C9] text-xs">
                      {tCommon("noImage")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  {(product.selectedColor || product.selectedSize) && (
                    <p className="text-xs text-[#C9C9C9] mt-1">
                      {product.selectedColor && `${product.selectedColor}`}
                      {product.selectedColor && product.selectedSize && " • "}
                      {product.selectedSize && `${product.selectedSize}`}
                    </p>
                  )}
                  <p className="text-sm text-[#C9C9C9] mt-1">
                    {tCart("quantity")}: {quantity} ×{" "}
                    {product.price?.toFixed(2)} {tCommon("currency")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {productTotal.toFixed(2)} {tCommon("currency")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promo Code */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            {tCart("promoCode")}
          </label>
          {appliedPromoCode ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-green-50 border border-green-200 rounded px-3 py-2 flex items-center justify-between">
                <span className="text-green-700 font-medium">
                  {tCart("promoApplied", {
                    code: appliedPromoCode,
                    discount: discountPercentage,
                  })}
                </span>
                <button
                  type="button"
                  onClick={handleRemovePromoCode}
                  className="text-green-700 hover:text-green-900 ml-2"
                  aria-label={tCart("promoRemove")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={tCart("promoPlaceholder")}
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyPromoCode();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-700 rounded-lg bg-black text-white focus:outline-none focus:ring-2 focus:ring-orange"
              />
              <button
                type="button"
                onClick={handleApplyPromoCode}
                disabled={validatingPromo}
                className="bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {validatingPromo ? tCart("applying") : tCart("apply")}
              </button>
            </div>
          )}
          {promoError && (
            <p className="text-red-600 text-sm mt-1">{promoError}</p>
          )}
        </div>

        {/* Order Totals */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#C9C9C9]">
              {tCheckout("items")} ({totalItems})
            </span>
            <span className="font-semibold text-white">
              {subtotal.toFixed(2)} {tCommon("currency")}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#C9C9C9]">{tCheckout("shipping")}</span>
            <span className="font-semibold text-green-600">
              {shippingFee > 0
                ? `${shippingFee.toFixed(2)} ${tCommon("currency")}`
                : tCart("freeShipping")}
            </span>
          </div>

          {appliedPromoCode && discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-[#C9C9C9]">
                {tCheckout("discount")} ({appliedPromoCode})
              </span>
              <span className="font-semibold">
                -{discountAmount.toFixed(2)} {tCommon("currency")}
              </span>
            </div>
          )}

          <hr className="border-gray-800" />

          <div className="flex justify-between">
            <span className="text-lg font-bold text-white">
              {tCheckout("total")}
            </span>
            <span className="text-xl font-bold text-white">
              {totalPrice.toFixed(2)} {tCommon("currency")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;
