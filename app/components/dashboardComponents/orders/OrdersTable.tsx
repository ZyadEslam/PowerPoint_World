"use client";
import React from "react";
import { Package, Loader2 } from "lucide-react";
import { Order } from "@/app/types/orders";
import { OrderRow } from "./OrderRow";
import { useTranslations, useLocale } from "next-intl";

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  onViewDetails: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading,
  onViewDetails,
}) => {
  const t = useTranslations("dashboard.orders.table");
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">{t("noOrders")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className={`text-center ${isArabic ? "rtl" : ""}`}>
                <th className="orders-table-th">{t("order")}</th>
                <th className="orders-table-th">{t("customer")}</th>
                <th className="orders-table-th">{t("date")}</th>
                <th className="orders-table-th">{t("status")}</th>
                <th className="orders-table-th">{t("total")}</th>
                <th className="orders-table-th">{t("payment")}</th>
                <th className="orders-table-th">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onViewDetails={onViewDetails}
                  isArabic={isArabic}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
