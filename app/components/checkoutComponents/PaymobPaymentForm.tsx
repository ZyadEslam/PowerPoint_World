"use client";
import React, { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaymobPaymentFormProps {
  amount: number;
  billingData: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
  };
  orderData: {
    userId?: string;
    products: unknown[];
    totalPrice: number;
    shippingFee: number;
    promoCode?: string;
    discountAmount?: number;
    discountPercentage?: number;
  };
  onPaymentError: (error: string) => void;
  onOrderCreating?: () => void;
}

const PaymobPaymentForm = ({
  amount,
  billingData,
  orderData,
  onPaymentError,
  onOrderCreating,
}: PaymobPaymentFormProps) => {
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Create order and redirect to Paymob payment page
  const handlePayment = async () => {
    setIsLoading(true);
    setError("");
    onOrderCreating?.();

    try {
      // Step 1: Create the order first with pending payment status
      const orderResponse = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...orderData,
          address: {
            name: billingData.name,
            phone: billingData.phone,
            address: billingData.address,
            city: billingData.city,
            state: billingData.state,
          },
          paymentMethod: "paymob",
          // Payment status will be "pending" by default
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.message || "Failed to create order");
      }

      const orderId = orderResult.orderId;

      // Step 2: Create Paymob payment with order ID
      const paymentResponse = await fetch("/api/paymob/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          billingData: {
            name: billingData.name,
            firstName: billingData.name.split(" ")[0],
            lastName: billingData.name.split(" ").slice(1).join(" ") || "N/A",
            phone: billingData.phone,
            email: billingData.email,
            address: billingData.address,
            street: billingData.address,
            city: billingData.city,
            state: billingData.state,
          },
          merchantOrderId: orderId, // Pass the actual order ID
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Failed to initialize payment");
      }

      // Step 3: Update order with paymobOrderId
      await fetch(`/api/order/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymobOrderId: String(paymentData.orderId),
        }),
      });

      // Step 4: Clear cart and checkout data before redirecting
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("checkoutData");
        sessionStorage.setItem("pendingOrderId", orderId);
      }

      // Step 5: Redirect to Paymob payment page
      window.location.href = paymentData.iframeUrl;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment initialization failed";
      setError(errorMessage);
      onPaymentError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-orange py-3 text-white rounded-lg hover:bg-orange/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t("processingPayment")}
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {t("pay")} {amount.toFixed(2)} {tCommon("currency")}
          </>
        )}
      </button>
    </div>
  );
};

export default PaymobPaymentForm;
