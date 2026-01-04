"use client";
import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ShoppingBag, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/app/UI/LoadingSpinner";

interface Product {
  _id?: string;
  name?: string;
  price?: number;
  quantityInCart?: number;
  quantity?: number;
  selectedColor?: string;
  selectedSize?: string;
  color?: string;
  size?: string;
  sku?: string;
}

interface Address {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  date: Date | string;
  totalPrice: number;
  orderState: string;
  paymentStatus: string;
  products: Product[];
  address: Address;
}

const OrderConfirmationPage = () => {
  const t = useTranslations("orders");
  const locale = useLocale();
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/order/${orderId}`);
        const result = await response.json();

        if (result.success) {
          setOrder(result.order);
        } else {
          setError(result.message || "Failed to load order");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full mx-4 text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <Link
            href={`/${locale}/my-orders`}
            className="inline-flex items-center gap-2 text-orange hover:text-orange/80 transition-colors duration-200 font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            {t("backToOrders")}
          </Link>
        </div>
      </div>
    );
  }

  const totalItems =
    order.products?.reduce(
      (total: number, product: Product) =>
        total + (product.quantityInCart || product.quantity || 1),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("orderConfirmed")}
          </h1>
          <p className="text-lg text-gray-600">{t("orderConfirmedDesc")}</p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-orange" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("orderConfirmation")}
                </h2>
                <p className="text-sm text-gray-600">
                  {t("weReceivedYourOrder")}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t("orderNumber")}</span>
              <span className="font-bold text-gray-900">
                #{order.orderNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t("orderDate")}</span>
              <span className="font-medium text-gray-900">
                {new Date(order.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t("items")}</span>
              <span className="font-medium text-gray-900">
                {totalItems} {totalItems === 1 ? t("item") : t("items")}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">
                {t("total")}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {order.totalPrice.toFixed(2)} EGP
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${locale}/my-orders/${order._id}`}
            className="flex-1 bg-orange text-white py-3 px-6 rounded-lg hover:bg-orange/90 transition-colors font-medium text-center flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            {t("viewOrder")}
          </Link>
          <Link
            href={`/${locale}/shop`}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
