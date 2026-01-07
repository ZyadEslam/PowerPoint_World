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

  const [templates, setTemplates] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();

      setTemplates(data.templates || []);
      setPagination(data.pagination);
    } catch {
      console.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

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
      setToast({ type: "success", message: "Template deleted successfully" });
      setDeleteModal(null);
    } catch {
      setToast({ type: "error", message: "Failed to delete template" });
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
      setToast({ type: "success", message: "Template updated" });
    } catch {
      setToast({ type: "error", message: "Failed to update template" });
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
      setToast({ type: "success", message: "Template updated" });
    } catch {
      setToast({ type: "error", message: "Failed to update template" });
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
    <div className="max-w-7xl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-orange" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("title") || "Templates"}
              </h1>
              <p className="text-sm text-gray-600">
                {t("subtitle") || "Manage your template catalog"}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/dashboard/templates/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange hover:bg-orange/90 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t("addTemplate") || "Add Template"}
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("searchPlaceholder") || "Search templates..."}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
            />
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Filter className="w-5 h-5" />
            {t("filters") || "Filters"}
          </button>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange mx-auto" />
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("noTemplates") || "No templates found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("noTemplatesDesc") || "Start by adding your first template"}
            </p>
            <Link
              href={`/${locale}/dashboard/templates/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange hover:bg-orange/90 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t("addTemplate") || "Add Template"}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    {t("template") || "Template"}
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    {t("category") || "Category"}
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    {t("price") || "Price"}
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    {t("stats") || "Stats"}
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    {t("status") || "Status"}
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">
                    {t("actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templates.map((template) => (
                  <tr key={template._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={template.thumbnail}
                            alt={template.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {template.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {template.categoryName}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">
                        {template.price === 0 ? "Free" : `${template.price} EGP`}
                      </div>
                      {template.oldPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          {template.oldPrice} EGP
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
                          {template.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            toggleActive(template._id, template.isActive)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            template.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              template.isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() =>
                            toggleFeatured(template._id, template.isFeatured)
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            template.isFeatured
                              ? "text-yellow-500 bg-yellow-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              template.isFeatured ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/templates/${template.slug}`}
                          target="_blank"
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/templates/${template._id}/edit`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal(template._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, pagination.total)} of{" "}
              {pagination.total} templates
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Template
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this template? All associated
                purchases will still be valid for existing customers.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal)}
                  disabled={deleting}
                  className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

