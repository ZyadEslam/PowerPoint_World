"use client";
import React from "react";
import { getStatusColor, getStatusIcon } from "@/app/utils/orderUtils";

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
}) => {
  const IconComponent = getStatusIcon(status);
  const isProcessing = status === "Processing";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
        status
      )}`}
    >
      <IconComponent className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
      {status}
    </span>
  );
};

