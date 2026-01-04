"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/hooks/useCart";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const OrderForm = () => {
  const router = useRouter();
  const locale = useLocale();
  const tCart = useTranslations("cart");
  const tCommon = useTranslations("common");
  const { cart, totalPrice } = useCart();

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Shipping fee state - will be calculated at checkout based on address
  const [shippingFee] = useState<number | null>(null);

  const isOrderValidToPlace = cart.length > 0;

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + (item.quantityInCart || 1);
    }, 0);
  }, [cart]);

  // Calculate final price with discount (shipping calculated at checkout)
  const finalPrice = useMemo(() => {
    const subtotal = totalPrice;
    const discountedPrice = Math.max(subtotal - discountAmount, 0);
    return discountedPrice;
  }, [totalPrice, discountAmount]);

  useEffect(() => {
    // Recalculate discount when total price or percentage changes
    if (discountPercentage > 0) {
      const subtotal = totalPrice;
      const newDiscount = (subtotal * discountPercentage) / 100;
      setDiscountAmount(newDiscount);
    }
  }, [totalPrice, discountPercentage]);

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
        const subtotal = totalPrice;
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

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOrderValidToPlace) {
      return;
    }

    // Store order data in sessionStorage to pass to checkout page
    const orderData = {
      products: cart,
      totalPrice: finalPrice,
      promoCode: appliedPromoCode || null,
      discountAmount: discountAmount,
      discountPercentage: discountPercentage,
      subtotal: totalPrice,
      shippingFee: shippingFee ?? 0,
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(orderData));

    // Redirect to checkout page
    router.push(`/${locale}/checkout`);
  };

  return (
    <form onSubmit={submitHandler} className="flex flex-col gap-4">
      <div className="order-summary-pair">
        <label className="font-medium text-gray-600">
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
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 md:flex-row">
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange"
            />
            <button
              type="button"
              onClick={handleApplyPromoCode}
              disabled={validatingPromo}
              className="bg-orange text-white w-full sm:w-auto py-2 px-10 rounded hover:bg-orange/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {validatingPromo ? tCart("applying") : tCart("apply")}
            </button>
          </div>
        )}
        {promoError && (
          <p className="text-red-600 text-sm mt-1">{promoError}</p>
        )}
      </div>
      <hr />
      <div className="order-summary-pair font-medium">
        <div className="flex justify-between">
          <p className="text-gray-500">
            {tCart("itemsLabel", { count: totalItems })}
          </p>
          <p>
            {totalPrice.toFixed(2)} {tCommon("currency")}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-500">{tCart("shippingFee")}</p>
          <p className="text-right text-sm text-gray-500">
            {tCart("shippingCalculatedAfterAddress")}
          </p>
        </div>
        {appliedPromoCode && discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <p className="text-gray-500">
              {tCart("discountLabel", { code: appliedPromoCode })}
            </p>
            <p>
              -{discountAmount.toFixed(2)} {tCommon("currency")}
            </p>
          </div>
        )}
      </div>
      <hr />
      <div className="flex justify-between font-medium text-xl">
        <p>{tCart("total")}</p>
        <p>
          {finalPrice.toFixed(2)} {tCommon("currency")}
        </p>
      </div>

      <button
        type="submit"
        className="bg-orange py-3 text-white cursor-pointer hover:bg-orange/90 disabled:cursor-not-allowed disabled:bg-gray-400"
        disabled={!isOrderValidToPlace}
      >
        {cart.length === 0
          ? tCart("cartEmptyShort")
          : tCart("proceedToCheckout")}
      </button>
    </form>
  );
};

export default OrderForm;
