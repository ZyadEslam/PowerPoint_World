"use client";
import React from "react";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface OrderStatusTimelineProps {
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippedDate?: Date | string;
  deliveredDate?: Date | string;
  estimatedDeliveryDate?: Date | string;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  status,
  shippedDate,
  deliveredDate,
  estimatedDeliveryDate,
}) => {
  const statuses = [
    {
      key: "Pending",
      label: "Pending",
      icon: Clock,
      color: "gray",
    },
    {
      key: "Processing",
      label: "Processing",
      icon: Package,
      color: "blue",
    },
    {
      key: "Shipped",
      label: "Shipped",
      icon: Truck,
      color: "orange",
    },
    {
      key: "Delivered",
      label: "Delivered",
      icon: CheckCircle,
      color: "green",
    },
  ];

  const getStatusIndex = (currentStatus: string) => {
    const index = statuses.findIndex((s) => s.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const currentIndex = getStatusIndex(status);
  const isCancelled = status === "Cancelled";

  const getStatusClasses = (index: number, statusColor: string, isActive: boolean) => {
    if (isCancelled || !isActive) {
      return {
        bg: "bg-gray-500",
        border: "border-gray-500",
        text: "text-gray-600",
      };
    }
    
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      gray: { bg: "bg-gray-500", border: "border-gray-500", text: "text-gray-600" },
      blue: { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-600" },
      orange: { bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-600" },
      green: { bg: "bg-green-500", border: "border-green-500", text: "text-green-600" },
    };
    
    return colorMap[statusColor] || colorMap.gray;
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Order Cancelled</p>
            <p className="text-sm text-red-700">This order has been cancelled</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Desktop Timeline */}
          <div className="hidden md:flex items-center justify-between relative">
            {statuses.map((statusItem, index) => {
              const StatusIcon = statusItem.icon;
              const isActive = index <= currentIndex;
              const colorClasses = getStatusClasses(index, statusItem.color, isActive);

              return (
                <React.Fragment key={statusItem.key}>
                  <div className="flex flex-col items-center flex-1 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive
                          ? `${colorClasses.bg} ${colorClasses.border} text-white`
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        isActive ? colorClasses.text : "text-gray-400"
                      }`}
                    >
                      {statusItem.label}
                    </p>
                    {index === currentIndex && index === 2 && shippedDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(shippedDate)}
                      </p>
                    )}
                    {index === currentIndex && index === 3 && deliveredDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(deliveredDate)}
                      </p>
                    )}
                  </div>
                  {index < statuses.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentIndex
                          ? colorClasses.bg
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-4">
            {statuses.map((statusItem, index) => {
              const StatusIcon = statusItem.icon;
              const isActive = index <= currentIndex;
              const colorClasses = getStatusClasses(index, statusItem.color, isActive);

              return (
                <div key={statusItem.key} className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0 ${
                      isActive
                        ? `${colorClasses.bg} ${colorClasses.border} text-white`
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? colorClasses.text : "text-gray-400"
                      }`}
                    >
                      {statusItem.label}
                    </p>
                    {index === currentIndex && index === 2 && shippedDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Shipped on {formatDate(shippedDate)}
                      </p>
                    )}
                    {index === currentIndex && index === 3 && deliveredDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Delivered on {formatDate(deliveredDate)}
                      </p>
                    )}
                    {index === currentIndex && index === 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Preparing your order
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {estimatedDeliveryDate && status !== "Delivered" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Estimated Delivery:</span>{" "}
                {formatDate(estimatedDeliveryDate)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;

