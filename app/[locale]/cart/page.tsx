"use client";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import React, { lazy, Suspense } from "react";
import LoadingSpinner from "../../UI/LoadingSpinner";
import { useCart } from "../../hooks/useCart";

const CartTable = lazy(() => import("../../components/cartComponents/CartTable"));
const OrderSummary = lazy(
  () => import("../../components/cartComponents/OrderSummary")
);

const CartPage = () => {
  const locale = useLocale();
  const t = useTranslations("cart");
  const { getCartItemCount, error, cart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{t("yourCart")}</h1>
                <p className="text-[#C9C9C9] mt-1">
                  {t("shoppingCartEmpty")}
                </p>
              </div>
            </div>
          </div>

          {/* Empty Cart State */}
          <div className="bg-black rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-[#C9C9C9]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t("empty")}
              </h3>
              <p className="text-[#C9C9C9] mb-6">
                {t("addItemsToCart")}
              </p>
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center px-6 py-3 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors duration-200 font-medium"
              >
                {t("startShopping")}
              </Link>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8">
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-2 text-orange hover:text-orange/80 transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t("yourCart")}</h1>
              <p className="text-[#C9C9C9] mt-1">
                {getCartItemCount()} {t("itemsInCart")}
              </p>
            </div>
          </div>
        </div>

        {/* Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
              <Suspense
                fallback={
                  <div className="p-8">
                    <LoadingSpinner />
                  </div>
                }
              >
                {error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : (
                  <CartTable />
                )}
              </Suspense>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="bg-black rounded-2xl shadow-sm border border-gray-800 p-6">
                  <LoadingSpinner />
                </div>
              }
            >
              <OrderSummary />
            </Suspense>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8">
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 text-orange hover:text-orange/80 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
