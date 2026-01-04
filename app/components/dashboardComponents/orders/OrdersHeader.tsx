"use client";
import React from "react";
import { Package, RefreshCw } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface OrdersHeaderProps {
  isConnected: boolean;
  onRefresh: () => void;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  isConnected,
  onRefresh,
}) => {
  const t = useTranslations("dashboard.orders");
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange/10 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange" />
          </div>
          <div className={isArabic ? "text-right" : ""}>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={isConnected ? t("connected") : t("disconnected")}
          />
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t("refresh")}
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

