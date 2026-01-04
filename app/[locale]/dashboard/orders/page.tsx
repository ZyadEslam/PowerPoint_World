"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { useOrders } from "@/app/hooks/useOrders";
import { useOrderSSE } from "@/app/hooks/useOrderSSE";
import { filterOrders } from "@/app/utils/orderUtils";
import { Order } from "@/app/types/orders";
import { OrdersHeader } from "@/app/components/dashboardComponents/orders/OrdersHeader";
import { OrdersFilters } from "@/app/components/dashboardComponents/orders/OrdersFilters";
import { OrdersTable } from "@/app/components/dashboardComponents/orders/OrdersTable";
import { OrdersPagination } from "@/app/components/dashboardComponents/orders/OrdersPagination";
import { OrderDetailsModal } from "@/app/components/dashboardComponents/orders/OrderDetailsModal";

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
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
  } = useOrders();

  // SSE connection for real-time updates - only enabled on dashboard
  const { isConnected } = useOrderSSE({
    statusFilter,
    onNewOrder: addOrder,
    onOrderUpdate: (orderId, orderState) => {
      updateOrderInList(orderId, { orderState });
    },
    enabled: true, // Explicitly enable for dashboard
  });

  // Initial fetch
  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [statusFilter, fetchOrders]);

  // Filter orders based on search query (debounced)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const filtered = filterOrders(orders, searchQuery);
      setFilteredOrders(filtered);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, orders]);

  // Update filtered orders when orders change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    }
  }, [orders, searchQuery]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchOrders(newPage, statusFilter);
    },
    [fetchOrders, statusFilter]
  );

  const handleUpdateOrder = useCallback(
    async (orderId: string, updates: Partial<Order>) => {
      await updateOrder(orderId, updates);
      await fetchOrders(page, statusFilter);
    },
    [updateOrder, fetchOrders, page, statusFilter]
  );

  const handleViewDetails = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleDeleteOrder = useCallback(
    async (orderId: string) => {
      try {
        await deleteOrder(orderId);
        handleCloseModal();
        await fetchOrders(page, statusFilter);
      } catch (err) {
        console.error("Error deleting order:", err);
      }
    },
    [deleteOrder, handleCloseModal, fetchOrders, page, statusFilter]
  );

  return (
    <div className="max-w-7xl mx-auto">
      <OrdersHeader
        isConnected={isConnected}
        onRefresh={() => fetchOrders(page, statusFilter)}
      />

      <OrdersFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <OrdersTable
        orders={filteredOrders}
        loading={loading}
        error={null}
        onViewDetails={handleViewDetails}
      />

      {!loading && totalPages > 1 && (
        <OrdersPagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleUpdateOrder}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
};

export default OrdersPage;
