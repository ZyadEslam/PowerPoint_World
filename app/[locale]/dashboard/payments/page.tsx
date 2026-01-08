"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  FileText,
  RefreshCw,
} from "lucide-react";

interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  templateId: {
    _id: string;
    name: string;
    thumbnail: string;
  };
  templateSnapshot: {
    name: string;
    thumbnail: string;
  };
  purchasePrice: number;
  originalPrice?: number;
  discountAmount?: number;
  promoCode?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymobOrderId?: string;
  paymobTransactionId?: string;
  receiptNumber: string;
  createdAt: string;
  downloadCount: number;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  pendingPayments: number;
  averageOrderValue: number;
}

export default function PaymentsPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard.payments");
  const isArabic = locale === "ar";

  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", currentPage.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} EGP`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: React.ElementType; className: string; label: string }> = {
      paid: {
        icon: CheckCircle,
        className: "bg-green-500/20 text-green-400",
        label: t("statusPaid") || "Paid",
      },
      pending: {
        icon: Clock,
        className: "bg-yellow-500/20 text-yellow-400",
        label: t("statusPending") || "Pending",
      },
      failed: {
        icon: XCircle,
        className: "bg-red-500/20 text-red-400",
        label: t("statusFailed") || "Failed",
      },
      refunded: {
        icon: RefreshCw,
        className: "bg-gray-500/20 text-gray-400",
        label: t("statusRefunded") || "Refunded",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-surface-card rounded-xl border border-white/10 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title") || "Payments"}</h1>
            <p className="text-sm text-gray-400">{t("subtitle") || "Track premium template purchases"}</p>
          </div>
        </div>

        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t("refresh") || "Refresh"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            label={t("totalRevenue") || "Total Revenue"}
            value={formatCurrency(stats.totalRevenue)}
            color="bg-green-500/20 text-green-400"
          />
          <StatCard
            icon={CreditCard}
            label={t("totalTransactions") || "Total Transactions"}
            value={stats.totalTransactions}
            color="bg-blue-500/20 text-blue-400"
          />
          <StatCard
            icon={CheckCircle}
            label={t("successfulPayments") || "Successful"}
            value={stats.successfulPayments}
            color="bg-primary-500/20 text-primary-400"
          />
          <StatCard
            icon={TrendingUp}
            label={t("averageOrder") || "Avg. Order Value"}
            value={formatCurrency(stats.averageOrderValue)}
            color="bg-purple-500/20 text-purple-400"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute ${isArabic ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("searchPlaceholder") || "Search by receipt, user..."}
              className={`w-full ${isArabic ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="all">{t("filterAll") || "All Status"}</option>
              <option value="paid">{t("filterPaid") || "Paid"}</option>
              <option value="pending">{t("filterPending") || "Pending"}</option>
              <option value="failed">{t("filterFailed") || "Failed"}</option>
              <option value="refunded">{t("filterRefunded") || "Refunded"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-surface-card rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t("noPayments") || "No payments found"}</h3>
            <p className="text-gray-500">{t("noPaymentsDesc") || "Payments will appear here when customers make purchases"}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30 border-b border-white/10">
                  <tr>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-6 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("receipt") || "Receipt"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("customer") || "Customer"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("template") || "Template"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("amount") || "Amount"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("status") || "Status"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("date") || "Date"}
                    </th>
                    <th className={`${isArabic ? "text-left" : "text-right"} py-4 px-6 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((payment, index) => (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-primary-400">{payment.receiptNumber}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{payment.userId?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">{payment.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded bg-black/50 border border-white/10 overflow-hidden relative">
                            {(payment.templateSnapshot?.thumbnail || payment.templateId?.thumbnail) && (
                              <Image
                                src={payment.templateSnapshot?.thumbnail || payment.templateId?.thumbnail || ""}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="text-white truncate max-w-[150px]">
                            {payment.templateSnapshot?.name || payment.templateId?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{formatCurrency(payment.purchasePrice)}</div>
                        {payment.discountAmount && payment.discountAmount > 0 && (
                          <div className="text-xs text-green-400">-{formatCurrency(payment.discountAmount)}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(payment.paymentStatus)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`flex items-center gap-2 ${isArabic ? "justify-start" : "justify-end"}`}>
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black/30 rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm text-primary-400">{payment.receiptNumber}</span>
                    {getStatusBadge(payment.paymentStatus)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-white">{payment.userId?.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400 truncate">
                        {payment.templateSnapshot?.name || payment.templateId?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <span className="text-xl font-bold text-white">{formatCurrency(payment.purchasePrice)}</span>
                      <span className="text-xs text-gray-500">{formatDate(payment.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <span className="px-4 py-2 text-white font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-card rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{t("paymentDetails") || "Payment Details"}</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-black/30 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">{t("receiptNumber") || "Receipt Number"}</p>
                  <p className="font-mono text-primary-400">{selectedPayment.receiptNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/30 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">{t("amount") || "Amount"}</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(selectedPayment.purchasePrice)}</p>
                  </div>
                  <div className="p-4 bg-black/30 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">{t("status") || "Status"}</p>
                    {getStatusBadge(selectedPayment.paymentStatus)}
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">{t("customer") || "Customer"}</p>
                  <p className="text-white font-medium">{selectedPayment.userId?.name}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.userId?.email}</p>
                </div>

                <div className="p-4 bg-black/30 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">{t("template") || "Template"}</p>
                  <p className="text-white">{selectedPayment.templateSnapshot?.name || selectedPayment.templateId?.name}</p>
                </div>

                {selectedPayment.promoCode && (
                  <div className="p-4 bg-black/30 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">{t("promoCode") || "Promo Code"}</p>
                    <p className="text-green-400 font-medium">{selectedPayment.promoCode}</p>
                    {selectedPayment.discountAmount && (
                      <p className="text-sm text-gray-500">-{formatCurrency(selectedPayment.discountAmount)}</p>
                    )}
                  </div>
                )}

                <div className="p-4 bg-black/30 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">{t("downloads") || "Downloads"}</p>
                  <p className="text-white">{selectedPayment.downloadCount} {t("times") || "times"}</p>
                </div>

                <div className="p-4 bg-black/30 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">{t("date") || "Date"}</p>
                  <p className="text-white">{formatDate(selectedPayment.createdAt)}</p>
                </div>

                {selectedPayment.paymobTransactionId && (
                  <div className="p-4 bg-black/30 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">{t("transactionId") || "Transaction ID"}</p>
                    <p className="font-mono text-sm text-gray-300">{selectedPayment.paymobTransactionId}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
