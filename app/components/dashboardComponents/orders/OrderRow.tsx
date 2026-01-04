"use client";
import React from "react";
import { Eye } from "lucide-react";
import { Order } from "@/app/types/orders";
import {
  formatOrderDate,
  formatOrderTime,
  formatPrice,
} from "@/app/utils/orderUtils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useTranslations } from "next-intl";

interface OrderRowProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  isArabic: boolean;
}

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  onViewDetails,
  isArabic,
}) => {
  const tTable = useTranslations("dashboard.orders.table");
  const tPayment = useTranslations("dashboard.orders.paymentStatus");

  return (
    <tr
      key={order._id}
      className="hover:bg-gray-50 transition-colors text-center"
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          #{order.orderNumber}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-gray-900">{order.userName}</div>
        <div className="text-sm text-gray-500">{order.userEmail}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatOrderDate(order.date)}
        </div>
        <div className="text-xs text-gray-500">
          {formatOrderTime(order.date)}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <OrderStatusBadge status={order.orderState} />
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatPrice(order.totalPrice)}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            order.paymentStatus === "paid"
              ? "bg-green-100 text-green-800"
              : order.paymentStatus === "refunded"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {tPayment(
            order.paymentStatus as "pending" | "paid" | "failed" | "refunded"
          )}
        </span>
      </td>
      <td
        className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${
          isArabic ? "text-left" : "text-right"
        }`}
      >
        <button
          onClick={() => onViewDetails(order)}
          className="text-orange hover:text-orange/80 transition-colors p-2 hover:bg-orange/10 rounded-lg"
          title={tTable("actions")}
        >
          <Eye className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};
