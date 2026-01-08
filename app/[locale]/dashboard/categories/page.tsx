"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  Edit2,
  Save,
  X,
  Trash2,
  Loader2,
  FolderTree,
  AlertCircle,
  CheckCircle,
  GripVertical,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const t = useTranslations("dashboard.categories");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
  } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (data.success) {
        const sorted = (data.data || []).sort((a: Category, b: Category) => {
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        setCategories(sorted);
      }
    } catch {
      setToast({ type: "error", message: t("messages.fetchError") || "Failed to fetch categories" });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setEditingValues({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const handleSave = async (categoryId: string) => {
    if (!editingValues) return;
    if (!editingValues.name.trim() || !editingValues.slug.trim()) {
      setToast({ type: "error", message: t("messages.nameRequired") || "Name and slug are required" });
      return;
    }

    try {
      setUpdating(categoryId);
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingValues),
      });

      if (!response.ok) throw new Error("Failed to update");

      const data = await response.json();
      if (data.success) {
        setToast({ type: "success", message: t("messages.updateSuccess") || "Category updated" });
        setEditingId(null);
        setEditingValues(null);
        fetchCategories();
      }
    } catch {
      setToast({ type: "error", message: t("messages.updateError") || "Failed to update category" });
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (categoryId: string, categorySlug: string) => {
    try {
      setDeleting(categoryId);
      const response = await fetch(`/api/categories/${categorySlug}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setToast({ type: "success", message: t("messages.deleteSuccess") || "Category deleted" });
      setDeleteConfirm(null);
      fetchCategories();
    } catch {
      setToast({ type: "error", message: t("messages.deleteError") || "Failed to delete category" });
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (categoryId: string, currentValue: boolean) => {
    setCategories((prev) =>
      prev.map((cat) => (cat._id === categoryId ? { ...cat, isActive: !currentValue } : cat))
    );

    try {
      setUpdating(categoryId);
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentValue }),
      });

      if (!response.ok) {
        setCategories((prev) =>
          prev.map((cat) => (cat._id === categoryId ? { ...cat, isActive: currentValue } : cat))
        );
        throw new Error("Failed to update");
      }

      setToast({ type: "success", message: t("messages.updateSuccess") || "Category updated" });
    } catch {
      setToast({ type: "error", message: t("messages.updateError") || "Failed to update" });
    } finally {
      setUpdating(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setToast({ type: "error", message: t("messages.nameRequired") || "Name is required" });
      return;
    }

    try {
      setUpdating("new");
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCategory,
          slug: newCategory.slug || generateSlug(newCategory.name),
        }),
      });

      if (!response.ok) throw new Error("Failed to create");

      setToast({ type: "success", message: t("messages.createSuccess") || "Category created" });
      setShowAddModal(false);
      setNewCategory({ name: "", slug: "", description: "", isActive: true });
      fetchCategories();
    } catch {
      setToast({ type: "error", message: t("messages.createError") || "Failed to create category" });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 p-1 hover:bg-white/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <FolderTree className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title") || "Categories"}</h1>
            <p className="text-sm text-gray-400">{t("subtitle") || "Organize your templates"}</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-black font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          {t("addCategory") || "Add Category"}
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-surface-card rounded-2xl border border-white/10 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <FolderTree className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t("noCategories") || "No categories found"}</h3>
            <p className="text-gray-500 mb-6">{t("noCategoriesDesc") || "Start by adding your first category"}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t("addCategory") || "Add Category"}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 sm:p-6 hover:bg-white/5 transition-colors"
              >
                {editingId === category._id && editingValues ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          {t("form.nameLabel") || "Name"}
                        </label>
                        <input
                          type="text"
                          value={editingValues.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setEditingValues({
                              ...editingValues,
                              name: newName,
                              slug: generateSlug(newName),
                            });
                          }}
                          className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          {t("form.slugLabel") || "Slug"}
                        </label>
                        <input
                          type="text"
                          value={editingValues.slug}
                          onChange={(e) =>
                            setEditingValues({ ...editingValues, slug: generateSlug(e.target.value) })
                          }
                          className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingValues.isActive}
                            onChange={(e) =>
                              setEditingValues({ ...editingValues, isActive: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition-colors" />
                          <div className="absolute w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                          <span className="text-sm text-gray-400">{t("form.activeLabel") || "Active"}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{t("form.priorityLabel") || "Priority"}:</span>
                          <input
                            type="number"
                            min="0"
                            value={editingValues.sortOrder}
                            onChange={(e) =>
                              setEditingValues({ ...editingValues, sortOrder: parseInt(e.target.value) || 0 })
                            }
                            className="w-20 px-2 py-1 bg-black/50 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(category._id)}
                          disabled={updating === category._id}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {updating === category._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                          {category.slug}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1 truncate">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleActive(category._id, category.isActive)}
                        disabled={updating === category._id}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          category.isActive ? "bg-green-500" : "bg-gray-600"
                        } ${updating === category._id ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                            category.isActive ? (isArabic ? "left-0.5" : "right-0.5") : (isArabic ? "right-0.5" : "left-0.5")
                          }`}
                        />
                      </button>
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                        #{category.sortOrder}
                      </span>
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirm === category._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(category._id, category.slug)}
                            disabled={deleting === category._id}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            {deleting === category._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(category._id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-card rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{t("addCategory") || "Add Category"}</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t("form.nameLabel") || "Name"} *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewCategory({
                        ...newCategory,
                        name,
                        slug: generateSlug(name),
                      });
                    }}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50"
                    placeholder={t("form.namePlaceholder") || "Category name"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t("form.slugLabel") || "Slug"}
                  </label>
                  <input
                    type="text"
                    value={newCategory.slug}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, slug: generateSlug(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="category-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t("form.descriptionLabel") || "Description"}
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                    placeholder={t("form.descriptionPlaceholder") || "Optional description"}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={newCategory.isActive}
                      onChange={(e) => setNewCategory({ ...newCategory, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                  </div>
                  <span className="text-gray-300">{t("form.activeLabel") || "Active"}</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                  >
                    {t("cancel") || "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={updating === "new"}
                    className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating === "new" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        {t("create") || "Create"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
