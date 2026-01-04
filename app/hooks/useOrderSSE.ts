import { useEffect, useRef, useState } from "react";
import { Order } from "@/app/types/orders";

interface UseOrderSSEReturn {
  isConnected: boolean;
}

interface UseOrderSSEOptions {
  statusFilter: string;
  onNewOrder: (order: Order) => void;
  onOrderUpdate: (orderId: string, orderState: Order["orderState"]) => void;
  enabled?: boolean; // Add option to conditionally enable SSE
}

export const useOrderSSE = ({
  statusFilter,
  onNewOrder,
  onOrderUpdate,
  enabled = true, // Default to enabled for backward compatibility
}: UseOrderSSEOptions): UseOrderSSEReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Don't connect if disabled
    if (!enabled) {
      return;
    }

    const connectSSE = () => {
      try {
        const eventSource = new EventSource("/api/admin/orders/stream");
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.addEventListener("connected", () => {
          setIsConnected(true);
        });

        eventSource.addEventListener("heartbeat", () => {
          // Connection is alive
        });

        eventSource.addEventListener("new-order", (event) => {
          const data = JSON.parse(event.data);

          // Only add if it matches current status filter
          if (statusFilter === "all" || data.orderState === statusFilter) {
            const order: Order = {
              _id: data.orderId,
              orderNumber: data.orderNumber,
              date: data.createdAt,
              totalPrice: data.totalPrice,
              orderState: data.orderState,
              paymentStatus: data.paymentStatus,
              paymentMethod: "",
              userId: data.userId,
              userName: data.userName,
              userEmail: data.userEmail,
            };
            onNewOrder(order);
          }
        });

        eventSource.addEventListener("order-updated", (event) => {
          const data = JSON.parse(event.data);
          onOrderUpdate(data.orderId, data.orderState);
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource.close();

          // Reconnect after 3 seconds
          setTimeout(() => {
            connectSSE();
          }, 3000);
        };
      } catch {
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [statusFilter, onNewOrder, onOrderUpdate, enabled]);

  return { isConnected };
};

