"use client";
import React, { useState } from "react";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface OrdersFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
}

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}) => {
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const t = useTranslations("dashboard.orders");
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className={`absolute ${
              isArabic ? "right-3" : "left-3"
            } top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`}
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full ${
              isArabic ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange`}
            dir={isArabic ? "rtl" : "ltr"}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {statusFilter === "all"
                ? t("allStatus")
                : t(`statuses.${statusFilter}` as "statuses.Pending" | "statuses.Processing" | "statuses.Shipped" | "statuses.Delivered" | "statuses.Cancelled")}
            </span>
            {isStatusFilterOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
          {isStatusFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onStatusFilterChange("all");
                  setIsStatusFilterOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                  statusFilter === "all" ? "bg-orange/10 text-orange" : ""
                }`}
              >
                {t("allStatus")}
              </button>
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusFilterChange(status);
                    setIsStatusFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                    statusFilter === status ? "bg-orange/10 text-orange" : ""
                  }`}
                >
                  {t(`statuses.${status}` as "statuses.Pending" | "statuses.Processing" | "statuses.Shipped" | "statuses.Delivered" | "statuses.Cancelled")}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

