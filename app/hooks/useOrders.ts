import { useState, useCallback } from "react";
import { Order, OrdersResponse } from "@/app/types/orders";

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  fetchOrders: (pageNum?: number, statusFilter?: string) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderInList: (orderId: string, updates: Partial<Order>) => void;
}

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(
    async (pageNum: number = 1, statusFilter: string = "all") => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "15",
          ...(statusFilter !== "all" && { status: statusFilter }),
        });

        const response = await fetch(`/api/admin/orders?${params}`);
        const data: OrdersResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            (data as unknown as { error: string }).error ||
              "Failed to fetch orders"
          );
        }

        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        setPage(pageNum);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateOrder = useCallback(
    async (orderId: string, updates: Partial<Order>) => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update order");
        }

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...updates } : order
          )
        );
      } catch (err) {
        console.error("Error updating order:", err);
        throw err;
      }
    },
    []
  );

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      // Check if order already exists
      const exists = prev.some((o) => o._id === order._id);
      if (exists) return prev;
      return [order, ...prev];
    });
  }, []);

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order");
      }

      // Remove order from local state
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
      throw err;
    }
  }, []);

  const updateOrderInList = useCallback(
    (orderId: string, updates: Partial<Order>) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, ...updates } : order
        )
      );
    },
    []
  );

  return {
    orders,
    loading,
    error,
    page,
    totalPages,
    fetchOrders,
    updateOrder,
    deleteOrder,
    addOrder,
    updateOrderInList,
  };
};
