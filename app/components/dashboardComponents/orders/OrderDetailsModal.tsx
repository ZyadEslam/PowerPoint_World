"use client";
import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, X, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Order, OrderFormData, OrderProduct } from "@/app/types/orders";
import { formatOrderFullDate, formatPrice } from "@/app/utils/orderUtils";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (orderId: string, updates: Partial<Order>) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const t = useTranslations("dashboard.orders.updateModal");
  const tDetails = useTranslations("dashboard.orders.details");
  const tPayment = useTranslations("dashboard.orders.paymentStatus");
  const tStatuses = useTranslations("dashboard.orders.statuses");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [fullOrder, setFullOrder] = useState<Order | null>(order);
  const [formData, setFormData] = useState<OrderFormData>({});

  // Fetch full order details when modal opens
  useEffect(() => {
    if (isOpen && order) {
      setIsLoadingDetails(true);
      fetch(`/api/admin/orders/${order._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) {
            setFullOrder(data.order);
            setFormData({
              orderState: data.order.orderState,
              paymentStatus: data.order.paymentStatus as
                | "pending"
                | "paid"
                | "failed"
                | "refunded",
              trackingNumber: data.order.trackingNumber || "",
              estimatedDeliveryDate: data.order.estimatedDeliveryDate
                ? new Date(data.order.estimatedDeliveryDate)
                    .toISOString()
                    .split("T")[0]
                : "",
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching order details:", err);
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [isOpen, order]);

  useEffect(() => {
    if (fullOrder) {
      setFormData({
        orderState: fullOrder.orderState,
        trackingNumber: fullOrder.trackingNumber || "",
        estimatedDeliveryDate: fullOrder.estimatedDeliveryDate
          ? new Date(fullOrder.estimatedDeliveryDate)
              .toISOString()
              .split("T")[0]
          : "",
      });
    }
  }, [fullOrder]);

  if (!isOpen || !order) return null;

  const displayOrder = fullOrder || order;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updates: Partial<Order> = {
        orderState: formData.orderState,
        paymentStatus: formData.paymentStatus,
        trackingNumber: formData.trackingNumber,
        estimatedDeliveryDate: formData.estimatedDeliveryDate || undefined,
      };
      await onUpdate(order._id, updates);
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    setIsDeleting(true);
    try {
      await onDelete(order._id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Order #{displayOrder.orderNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange" />
            </div>
          ) : (
            <>
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {t("customerInformation")}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-gray-900 font-medium">
                      {displayOrder.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {displayOrder.userEmail}
                    </p>
                    {displayOrder.address?.phone && (
                      <p className="text-sm text-gray-700 font-medium mt-2 flex items-center gap-2">
                        <span className="text-lg">📞</span>
                        <span>{displayOrder.address.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {t("orderDate")}
                  </h3>
                  <p className="text-gray-900">
                    {formatOrderFullDate(displayOrder.date)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {t("totalPrice")}
                  </h3>
                  <p className="text-gray-900 font-bold text-xl">
                    {formatPrice(displayOrder.totalPrice)}
                  </p>
                  {(displayOrder.discountAmount || 0) > 0 && (
                    <p className="text-sm text-green-600">
                      {t("discount")}{" "}
                      {formatPrice(displayOrder.discountAmount || 0)}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {t("payment")}
                  </h3>
                  <p className="text-gray-900 capitalize">
                    {displayOrder.paymentMethod.replace("_", " ")}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                      displayOrder.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : displayOrder.paymentStatus === "refunded"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {tPayment(
                      displayOrder.paymentStatus as
                        | "pending"
                        | "paid"
                        | "failed"
                        | "refunded"
                    )}
                  </span>
                </div>
              </div>

              {/* Address */}
              {displayOrder.address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {t("shippingAddress")}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">
                          {displayOrder.address.name}
                        </p>
                        {displayOrder.address.phone && (
                          <p className="text-gray-700 font-medium mt-1">
                            📞 {displayOrder.address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-600">
                        {displayOrder.address.address}
                      </p>
                      <p className="text-gray-600">
                        {displayOrder.address.city},{" "}
                        {displayOrder.address.state}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Products - Preparation View */}
              {displayOrder.products && displayOrder.products.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Products to Prepare
                  </h3>
                  <div className="space-y-3">
                    {displayOrder.products.map(
                      (
                        product: OrderProduct & {
                          quantity?: number;
                          size?: string;
                          color?: string;
                          sku?: string;
                        },
                        idx: number
                      ) => {
                        const quantity = product.quantity || 1;
                        const size = product.size;
                        const color = product.color;
                        const sku = product.sku;
                        const itemPrice = product.price || 0;
                        const totalItemPrice = itemPrice * quantity;

                        return (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                {/* Product Name */}
                                <p className="font-semibold text-gray-900 text-base mb-2">
                                  {product.name}
                                </p>

                                {/* Quantity - Prominently displayed */}
                                <div className="flex items-center gap-4 flex-wrap mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase">
                                      {t("qty")}
                                    </span>
                                    <span className="px-3 py-1 bg-orange/10 text-orange font-bold text-lg rounded-md border border-orange/20">
                                      {quantity}
                                    </span>
                                  </div>

                                  {/* Size */}
                                  {size && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-500 uppercase">
                                        {t("size")}
                                      </span>
                                      <span className="px-2 py-1 bg-gray-200 text-gray-800 font-medium text-sm rounded">
                                        {size}
                                      </span>
                                    </div>
                                  )}

                                  {/* Color */}
                                  {color && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-500 uppercase">
                                        {t("color")}
                                      </span>
                                      <span className="px-2 py-1 bg-gray-200 text-gray-800 font-medium text-sm rounded">
                                        {color}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* SKU */}
                                {sku && (
                                  <div className="mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase">
                                      {t("sku")}
                                    </span>
                                    <span className="ml-2 text-sm font-mono text-gray-700">
                                      {sku}
                                    </span>
                                  </div>
                                )}

                                {/* Price */}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-sm text-gray-600">
                                    {formatPrice(itemPrice)} × {quantity} =
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {formatPrice(totalItemPrice)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Update Form */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 pt-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("updateOrder")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("orderStatus")}
                </label>
                <select
                  value={formData.orderState || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      orderState: e.target.value as Order["orderState"],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                >
                  <option value="Pending">{tStatuses("Pending")}</option>
                  <option value="Processing">{tStatuses("Processing")}</option>
                  <option value="Shipped">{tStatuses("Shipped")}</option>
                  <option value="Delivered">{tStatuses("Delivered")}</option>
                  <option value="Cancelled">{tStatuses("Cancelled")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("paymentStatus")}
                </label>
                <select
                  value={formData.paymentStatus || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentStatus: e.target.value as
                        | "pending"
                        | "paid"
                        | "failed"
                        | "refunded",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                >
                  <option value="pending">{tPayment("pending")}</option>
                  <option value="paid">{tPayment("paid")}</option>
                  <option value="failed">{tPayment("failed")}</option>
                  <option value="refunded">{tPayment("refunded")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("trackingNumber")}
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, trackingNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                  placeholder={t("trackingNumberPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("estimatedDeliveryDate")}
                </label>
                <input
                  type="date"
                  value={formData.estimatedDeliveryDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDeliveryDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting || isUpdating}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {tDetails("delete")}
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || isDeleting}
                  className="px-6 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("updating")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {t("updateOrder")}
                    </>
                  )}
                </button>
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 mb-4">{tDetails("deleteConfirm")}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {tDetails("deleting")}
                      </>
                    ) : (
                      tDetails("delete")
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
