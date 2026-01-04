"use client";
import React, { memo, useState, useEffect } from "react";
import { useCart } from "@/app/hooks/useCart";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, ArrowRight } from "lucide-react";

const OrderSummary = memo(() => {
  const { totalPrice, cart } = useCart();
  const tCart = useTranslations("cart");
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const { status } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const [shippingFees, setShippingFees] = useState<{
    insideCairoGiza: number;
    outsideCities: number;
  }>({ insideCairoGiza: 0, outsideCities: 0 });

  // Fetch shipping fee on component mount
  useEffect(() => {
    const fetchShippingFee = async () => {
      try {
        const response = await fetch("/api/settings");
        const result = await response.json();
        if (result.success) {
          setShippingFees({
            insideCairoGiza: result.shippingFeeInside ?? result.shippingFee ?? 0,
            outsideCities: result.shippingFeeOutside ?? result.shippingFee ?? 0,
          });
        }
      } catch (error) {
        console.error("Error fetching shipping fee:", error);
        setShippingFees({ insideCairoGiza: 0, outsideCities: 0 });
      }
    };
    fetchShippingFee();
  }, []);

  // Calculate total with shipping
  const totalWithShipping = totalPrice + shippingFees.insideCairoGiza;

  const handleSignIn = async () => {
    try {
      // Ensure guest cart is saved before redirecting to login
      if (cart.length > 0 && typeof window !== "undefined") {
        const anonymousKey = "cart-anonymous";
        localStorage.setItem(anonymousKey, JSON.stringify(cart));
        console.log("Guest cart preserved before login:", cart);
      }

      await signIn("google", {
        callbackUrl: `/${locale}/cart`,
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;

    // Store cart data in sessionStorage for checkout page
    const checkoutData = {
      products: cart,
      source: "cart",
      subtotal: totalPrice,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    }
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-orange/10 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-orange"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {tCheckout("orderSummary")}
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">
              {tCart("subtotalItems", { count: cart.length })}
            </span>
            <span className="font-semibold text-gray-900">
              {totalPrice.toFixed(2)} {tCommon("currency")}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">{tCheckout("shipping")}</span>
            <span className="text-right">
              <span className="block font-semibold text-green-600">
                {shippingFees.insideCairoGiza > 0
                  ? `${shippingFees.insideCairoGiza.toFixed(2)} ${tCommon("currency")}`
                  : tCart("freeShipping")}
              </span>
              {shippingFees.outsideCities !== shippingFees.insideCairoGiza && (
                <span className="block text-xs text-gray-500">
                  {tCart("shippingOutsideNote", {
                    amount: shippingFees.outsideCities.toFixed(2),
                    currency: tCommon("currency"),
                  })}
                </span>
              )}
            </span>
          </div>

          <hr className="border-gray-200" />

          <div className="flex justify-between items-center py-2">
            <span className="text-lg font-bold text-gray-900">
              {tCart("total")}
            </span>
            <span className="text-xl font-bold text-gray-900">
              {totalWithShipping.toFixed(2)} {tCommon("currency")}
            </span>
          </div>
        </div>

        {/* Proceed to Checkout Button */}
        <button
          onClick={handleProceedToCheckout}
          disabled={cart.length === 0}
          className="mt-6 w-full bg-orange py-3 text-white rounded-lg hover:bg-orange/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          <span>{tCart("proceedToCheckout")}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Creative Login Prompt for Guest Users */}
        {status === "unauthenticated" && (
          <div className="mt-6 p-4 bg-gradient-to-br from-orange/10 via-orange/5 to-transparent border border-orange/20 rounded-xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-2 right-2 opacity-20">
              <Sparkles className="w-8 h-8 text-orange" />
            </div>
            <div className="absolute bottom-2 left-2 opacity-10">
              <Lock className="w-6 h-6 text-orange" />
            </div>

            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-orange" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Unlock Exclusive Benefits
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {tCart("signInToSave")}
                    faster checkout!
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignIn}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-orange to-orange/90 hover:from-orange/90 hover:to-orange text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <span>{tCart("signInWithGoogle")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {tCart("quickSecure")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

OrderSummary.displayName = "OrderSummary";

export default OrderSummary;
