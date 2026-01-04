import {
  Clock,
  Loader2,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { Order } from "@/app/types/orders";

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Processing: "bg-blue-100 text-blue-800 border-blue-200",
    Shipped: "bg-purple-100 text-purple-800 border-purple-200",
    Delivered: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const getStatusIcon = (status: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    Pending: Clock,
    Processing: Loader2,
    Shipped: Truck,
    Delivered: CheckCircle2,
    Cancelled: XCircle,
  };
  return icons[status] || AlertCircle;
};

export const formatOrderDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatOrderTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatOrderFullDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} EGP`;
};

export const filterOrders = (orders: Order[], searchQuery: string): Order[] => {
  if (!searchQuery.trim()) {
    return orders;
  }

  const query = searchQuery.toLowerCase();
  return orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(query) ||
      order.userName.toLowerCase().includes(query) ||
      order.userEmail.toLowerCase().includes(query)
  );
};
