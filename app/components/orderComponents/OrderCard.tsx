"use client";
import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Package, Calendar, DollarSign, ArrowRight } from "lucide-react";

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

interface OrderCardProps {
  order: {
    _id: string;
    orderNumber: string;
    date: Date | string;
    totalPrice: number;
    orderState: string;
    paymentStatus: string;
    products: Product[];
  };
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const locale = useLocale();
  const t = useTranslations("orders");

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-orange-100 text-orange-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalItems =
    order.products?.reduce(
      (total: number, product: Product) =>
        total + (product.quantityInCart || product.quantity || 1),
      0
    ) || 0;

  return (
    <Link href={`/${locale}/my-orders/${order._id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-orange" />
                <h3 className="text-lg font-bold text-gray-900">
                  {t("orderNumberPrefix")}
                  {order.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(order.date)}</span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                order.orderState
              )}`}
            >
              {order.orderState}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Items</span>
              <span className="font-medium text-gray-900">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Total</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {order.totalPrice.toFixed(2)} EGP
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {t("payment")}:{" "}
              <span
                className={`font-medium ${
                  order.paymentStatus === "paid"
                    ? "text-green-600"
                    : order.paymentStatus === "pending"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {order.paymentStatus === "paid"
                  ? t("paid")
                  : order.paymentStatus === "pending"
                  ? t("pending")
                  : t("failed")}
              </span>
            </span>
            <div className="flex items-center gap-1 text-orange hover:text-orange/80 transition-colors">
              <span className="text-sm font-medium">{t("viewDetails")}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;
