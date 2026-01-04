"use client";
import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
} from "lucide-react";
import OrderStatusTimeline from "@/app/components/orderComponents/OrderStatusTimeline";
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
  paymentMethod: string;
  products: Product[];
  address: Address;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date | string;
  shippedDate?: Date | string;
  deliveredDate?: Date | string;
  promoCode?: string;
  discountAmount?: number;
  discountPercentage?: number;
}

const OrderDetailPage = () => {
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
            <ArrowLeft className="w-4 h-4" />
            {t("backToOrders")}
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    return method === "cash_on_delivery"
      ? t("cashOnDelivery")
      : t("cardPayment");
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return t("paid");
      case "pending":
        return t("pendingPayment");
      case "failed":
        return t("failed");
      default:
        return status;
    }
  };

  const totalItems =
    order.products?.reduce(
      (total: number, product: Product) =>
        total + (product.quantityInCart || product.quantity || 1),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/my-orders`}
            className="inline-flex items-center gap-2 text-orange hover:text-orange/80 transition-colors duration-200 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToOrders")}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("orderDetails")}
              </h1>
              <p className="text-gray-600 mt-1">
                {t("orderNumber")}: #{order.orderNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("orderTimeline")}
                </h2>
              </div>
              <div className="p-6">
                <OrderStatusTimeline
                  status={
                    order.orderState as
                      | "Pending"
                      | "Processing"
                      | "Shipped"
                      | "Delivered"
                      | "Cancelled"
                  }
                  shippedDate={order.shippedDate}
                  deliveredDate={order.deliveredDate}
                  estimatedDeliveryDate={order.estimatedDeliveryDate}
                />
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("items")} ({totalItems})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {order.products?.map((product: Product, index: number) => (
                  <div key={index} className="p-6 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product._id ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/product/image/${product._id}?index=0&w=80&h=80`}
                          alt={product.name || "Product"}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name || "Product"}
                      </h3>
                      {(product.selectedColor ||
                        product.color ||
                        product.selectedSize ||
                        product.size) && (
                        <p className="text-sm text-gray-500 mb-2">
                          {product.selectedColor || product.color ? (
                            <span>
                              Color: {product.selectedColor || product.color}
                            </span>
                          ) : null}
                          {product.selectedSize || product.size ? (
                            <span className="ml-2">
                              Size: {product.selectedSize || product.size}
                            </span>
                          ) : null}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        Quantity:{" "}
                        {product.quantityInCart || product.quantity || 1}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {(product.price || 0).toFixed(2)} EGP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("orderSummary")}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("orderDate")}</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(order.date)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("orderStatus")}</span>
                  <span className="font-medium text-gray-900">
                    {order.orderState}
                  </span>
                </div>
                {order.promoCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Promo Code</span>
                    <span className="font-medium text-green-600">
                      {order.promoCode}
                    </span>
                  </div>
                )}
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="text-gray-600">{t("discount")}</span>
                    <span className="font-medium">
                      -{order.discountAmount.toFixed(2)} EGP
                    </span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    {t("total")}
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {order.totalPrice.toFixed(2)} EGP
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("shippingAddress")}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {order.address ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900">
                      {order.address.name}
                    </p>
                    <p>{order.address.address}</p>
                    <p>
                      {order.address.city}, {order.address.state}
                    </p>
                    <p>{order.address.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Address not available</p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("paymentMethod")}
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("paymentMethod")}</span>
                  <span className="font-medium text-gray-900">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("paymentStatus")}</span>
                  <span
                    className={`font-medium ${
                      order.paymentStatus === "paid"
                        ? "text-green-600"
                        : order.paymentStatus === "pending"
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-orange" />
                      <span className="text-sm font-semibold text-gray-900">
                        {t("trackingNumber")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-mono">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-orange" />
                      <span className="text-sm font-semibold text-gray-900">
                        {t("estimatedDelivery")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.estimatedDeliveryDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
