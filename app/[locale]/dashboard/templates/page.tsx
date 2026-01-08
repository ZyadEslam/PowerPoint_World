"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  Filter,
  Download,
  Star,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gift,
} from "lucide-react";

interface Template {
  _id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  oldPrice?: number;
  categoryName: string;
  isActive: boolean;
  isFeatured: boolean;
  isFree: boolean;
  purchaseCount: number;
  viewCount: number;
  rating: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminTemplatesPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard.templates");
  const isArabic = locale === "ar";

  const [templates, setTemplates] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "free" | "premium">("all");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", currentPage.toString());
      params.set("limit", "10");
      if (filterType !== "all") {
        params.set("type", filterType);
      }

      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();

      setTemplates(data.templates || []);
      setPagination(data.pagination);
    } catch {
      console.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, filterType]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Handle delete
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setTemplates((prev) => prev.filter((t) => t._id !== id));
      setToast({ type: "success", message: t("deleteSuccess") || "Template deleted successfully" });
      setDeleteModal(null);
    } catch {
      setToast({ type: "error", message: t("deleteError") || "Failed to delete template" });
    } finally {
      setDeleting(false);
    }
  };

  // Toggle featured
  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setTemplates((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, isFeatured: !isFeatured } : t
        )
      );
      setToast({ type: "success", message: t("updateSuccess") || "Template updated" });
    } catch {
      setToast({ type: "error", message: t("updateError") || "Failed to update template" });
    }
  };

  // Toggle active
  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setTemplates((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isActive: !isActive } : t))
      );
      setToast({ type: "success", message: t("updateSuccess") || "Template updated" });
    } catch {
      setToast({ type: "error", message: t("updateError") || "Failed to update template" });
    }
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-20 left-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-green-500/90 backdrop-blur-sm text-white"
                : "bg-red-500/90 backdrop-blur-sm text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("title") || "Templates"}
            </h1>
            <p className="text-sm text-gray-400">
              {t("subtitle") || "Manage your template catalog"}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/dashboard/templates/new`}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-black font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          {t("addTemplate") || "Add Template"}
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface-card rounded-2xl border border-white/10 p-4">
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
              placeholder={t("searchPlaceholder") || "Search templates..."}
              className={`w-full ${isArabic ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as "all" | "free" | "premium");
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
            >
              <option value="all">{t("filterAll") || "All Templates"}</option>
              <option value="free">{t("filterFree") || "Free Only"}</option>
              <option value="premium">{t("filterPremium") || "Premium Only"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid/Table */}
      <div className="bg-surface-card rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("noTemplates") || "No templates found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {t("noTemplatesDesc") || "Start by adding your first template"}
            </p>
            <Link
              href={`/${locale}/dashboard/templates/new`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t("addTemplate") || "Add Template"}
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30 border-b border-white/10">
                  <tr>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider`}>
                      {t("template") || "Template"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider`}>
                      {t("type") || "Type"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider`}>
                      {t("category") || "Category"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider`}>
                      {t("price") || "Price"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider`}>
                      {t("stats") || "Stats"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider`}>
                      {t("status") || "Status"}
                    </th>
                    <th className={`${isArabic ? "text-left" : "text-right"} py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider`}>
                      {t("actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {templates.map((template, index) => (
                    <motion.tr
                      key={template._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-black/50 border border-white/10 flex-shrink-0">
                            <Image
                              src={template.thumbnail}
                              alt={template.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-[200px]">
                              {template.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(template.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            template.isFree
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {template.isFree ? (
                            <>
                              <Gift className="w-3.5 h-3.5" />
                              {t("free") || "Free"}
                            </>
                          ) : (
                            <>
                              <Crown className="w-3.5 h-3.5" />
                              {t("premium") || "Premium"}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                          {template.categoryName}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">
                          {template.isFree || template.price === 0
                            ? t("free") || "Free"
                            : `${template.price} EGP`}
                        </div>
                        {template.oldPrice && !template.isFree && (
                          <div className="text-xs text-gray-500 line-through">
                            {template.oldPrice} EGP
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {template.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {template.purchaseCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {template.rating?.toFixed(1) || "5.0"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleActive(template._id, template.isActive)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              template.isActive ? "bg-green-500" : "bg-gray-600"
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                                template.isActive ? (isArabic ? "left-1" : "right-1") : (isArabic ? "right-1" : "left-1")
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => toggleFeatured(template._id, template.isFeatured)}
                            className={`p-2 rounded-lg transition-colors ${
                              template.isFeatured
                                ? "text-yellow-400 bg-yellow-500/20"
                                : "text-gray-500 hover:bg-white/10"
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 ${template.isFeatured ? "fill-current" : ""}`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`flex items-center gap-2 ${isArabic ? "justify-start" : "justify-end"}`}>
                          <Link
                            href={`/${locale}/templates/${template.slug}`}
                            target="_blank"
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/${locale}/dashboard/templates/${template._id}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal(template._id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
              {templates.map((template, index) => (
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black/30 rounded-xl border border-white/10 p-4"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                      <Image
                        src={template.thumbnail}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{template.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{template.categoryName}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            template.isFree
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {template.isFree ? <Gift className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                          {template.isFree ? (t("free") || "Free") : `${template.price} EGP`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {template.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {template.purchaseCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${locale}/dashboard/templates/${template._id}/edit`}
                        className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal(template._id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-400">
                  {t("showing") || "Showing"} {(currentPage - 1) * 10 + 1} -{" "}
                  {Math.min(currentPage * 10, pagination.total)} {t("of") || "of"}{" "}
                  {pagination.total} {t("templates") || "templates"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  <span className="px-4 py-2 text-white font-medium">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-card rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {t("deleteTitle") || "Delete Template"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t("deleteWarning") || "This action cannot be undone"}
                  </p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                {t("deleteConfirm") ||
                  "Are you sure you want to delete this template? All associated purchases will still be valid for existing customers."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                >
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  onClick={() => handleDelete(deleteModal)}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      {t("delete") || "Delete"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
