"use client";
import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, ShoppingBag, ArrowLeft } from "lucide-react";
import OrderCard from "@/app/components/orderComponents/OrderCard";
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

interface Order {
  _id: string;
  orderNumber: string;
  date: Date | string;
  totalPrice: number;
  orderState: string;
  paymentStatus: string;
  products: Product[];
}

const MyOrdersPage = () => {
  const t = useTranslations("orders");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status === "loading") return;
      
      if (status === "unauthenticated") {
        setError("Please sign in to view your orders");
        setLoading(false);
        return;
      }

      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/${session.user.id}/orders`);
        const result = await response.json();

        if (result.success) {
          setOrders(result.orders);
        } else {
          setError(result.message || "Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full mx-4 text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your orders</p>
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 text-orange hover:text-orange/80 transition-colors duration-200 font-medium"
          >
            <ShoppingBag className="w-4 h-4" />
            {t("startShopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 text-orange hover:text-orange/80 transition-colors duration-200 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("continueShopping")}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("myOrders")}
              </h1>
              <p className="text-gray-600 mt-1">{t("orderHistory")}</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("noOrders")}
              </h3>
              <p className="text-gray-600 mb-6">{t("noOrdersDesc")}</p>
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center px-6 py-3 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors duration-200 font-medium"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {t("startShopping")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;

