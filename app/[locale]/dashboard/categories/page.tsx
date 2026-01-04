"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Edit2, Save, X, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

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

const CategoriesPage = () => {
  const t = useTranslations("dashboard.categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{
    name: string;
    slug: string;
    isActive: boolean;
    sortOrder: number;
  } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Add cache-busting timestamp and use no-cache to ensure fresh data
      const response = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await response.json();

      if (data.success) {
        // Sort by sortOrder, then by createdAt
        const sorted = (data.data || []).sort((a: Category, b: Category) => {
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
          }
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setCategories(sorted);
      } else {
        setError(data.message || t("messages.fetchError"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("messages.fetchError"));
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
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const handleDelete = useCallback(
    async (categoryId: string, categorySlug: string) => {
      try {
        setDeleting(categoryId);
        setError(null);
        setSuccess(null);

        const response = await fetch(`/api/categories/${categorySlug}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || t("messages.deleteError"));
        }

        setSuccess(
          t("messages.deleteSuccess", {
            count: data.data?.productsReassigned || 0,
          })
        );
        setDeleteConfirm(null);
        await fetchCategories();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("messages.deleteError")
        );
      } finally {
        setDeleting(null);
      }
    },
    [t, fetchCategories]
  );

  const handleSave = async (categoryId: string) => {
    if (!editingValues) return;

    // Validate required fields
    if (!editingValues.name.trim()) {
      setError(t("messages.nameRequired"));
      return;
    }

    if (!editingValues.slug.trim()) {
      setError(t("messages.slugRequired"));
      return;
    }

    try {
      setUpdating(categoryId);
      setError(null);

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingValues.name.trim(),
          slug: editingValues.slug.trim(),
          isActive: editingValues.isActive,
          sortOrder: Math.max(0, Math.floor(editingValues.sortOrder)),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = t("messages.updateError");
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage =
            errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(t("messages.updateSuccess"));
        setEditingId(null);
        setEditingValues(null);
        // Small delay to ensure cache invalidation completes
        setTimeout(async () => {
          await fetchCategories();
        }, 100);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || t("messages.updateError"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("messages.updateError"));
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleActive = async (
    categoryId: string,
    currentValue: boolean
  ) => {
    // Optimistically update the UI immediately
    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat._id === categoryId ? { ...cat, isActive: !currentValue } : cat
      )
    );

    try {
      setUpdating(categoryId);
      setError(null);

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentValue,
        }),
      });

      if (!response.ok) {
        // Revert the optimistic update on error
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat._id === categoryId ? { ...cat, isActive: currentValue } : cat
          )
        );
        const errorText = await response.text();
        let errorMessage = t("messages.updateError");
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage =
            errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(t("messages.updateSuccess"));
        // Small delay to ensure cache invalidation completes, then refresh
        setTimeout(async () => {
          await fetchCategories();
        }, 100);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Revert the optimistic update on error
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat._id === categoryId ? { ...cat, isActive: currentValue } : cat
          )
        );
        setError(data.message || t("messages.updateError"));
      }
    } catch (err) {
      // Revert the optimistic update on error
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === categoryId ? { ...cat, isActive: currentValue } : cat
        )
      );
      setError(err instanceof Error ? err.message : t("messages.updateError"));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange/10 rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-orange" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-orange">
              {t("badge")}
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">{t("noCategories")}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      {t("table.name")}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      {t("table.slug")}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {t("table.active")}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {t("table.priority")}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {t("table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {editingId === category._id && editingValues ? (
                          <input
                            type="text"
                            value={editingValues.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              // Auto-generate slug from name if slug hasn't been manually edited
                              // We'll track if slug was manually edited by checking if it matches the generated slug
                              const currentGeneratedSlug = generateSlug(
                                editingValues.name
                              );
                              const wasAutoGenerated =
                                editingValues.slug === currentGeneratedSlug;

                              setEditingValues({
                                ...editingValues,
                                name: newName,
                                slug: wasAutoGenerated
                                  ? generateSlug(newName)
                                  : editingValues.slug,
                              });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none font-medium"
                            placeholder={t("form.namePlaceholder")}
                          />
                        ) : (
                          <>
                            <div className="font-medium text-gray-900">
                              {category.name}
                            </div>
                            {category.description && (
                              <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                                {category.description}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === category._id && editingValues ? (
                          <input
                            type="text"
                            value={editingValues.slug}
                            onChange={(e) => {
                              // Auto-format slug as user types
                              const formatted = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "-")
                                .replace(/-+/g, "-")
                                .replace(/(^-|-$)/g, "");
                              setEditingValues({
                                ...editingValues,
                                slug: formatted,
                              });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none font-mono"
                            placeholder={t("form.slugPlaceholder")}
                          />
                        ) : (
                          <span className="text-sm text-gray-600 font-mono">
                            {category.slug}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingId === category._id && editingValues ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingValues.isActive}
                              onChange={(e) =>
                                setEditingValues({
                                  ...editingValues,
                                  isActive: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                          </label>
                        ) : (
                          <button
                            onClick={() =>
                              handleToggleActive(
                                category._id,
                                category.isActive
                              )
                            }
                            disabled={updating === category._id}
                            className={`relative inline-flex items-center cursor-pointer ${
                              updating === category._id ? "opacity-50" : ""
                            }`}
                          >
                            <div
                              className={`w-11 h-6 rounded-full transition-colors ${
                                category.isActive ? "bg-orange" : "bg-gray-200"
                              }`}
                            >
                              <div
                                className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                                  category.isActive ? "translate-x-full" : ""
                                }`}
                              />
                            </div>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingId === category._id && editingValues ? (
                          <input
                            type="number"
                            min="0"
                            value={editingValues.sortOrder}
                            onChange={(e) =>
                              setEditingValues({
                                ...editingValues,
                                sortOrder: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none text-center"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {category.sortOrder}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingId === category._id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSave(category._id)}
                              disabled={updating === category._id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t("buttons.save")}
                            >
                              {updating === category._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updating === category._id}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title={t("buttons.cancel")}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : deleteConfirm === category._id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleDelete(category._id, category.slug)
                              }
                              disabled={deleting === category._id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t("buttons.delete")}
                            >
                              {deleting === category._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={deleting === category._id}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title={t("buttons.cancel")}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 text-orange hover:bg-orange/10 rounded-lg transition-colors"
                              title={t("buttons.edit")}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(category._id)}
                              disabled={deleting === category._id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t("buttons.delete")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div>
                    {editingId === category._id && editingValues ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editingValues.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              // Auto-generate slug from name if slug hasn't been manually edited
                              const currentGeneratedSlug = generateSlug(
                                editingValues.name
                              );
                              const wasAutoGenerated =
                                editingValues.slug === currentGeneratedSlug;

                              setEditingValues({
                                ...editingValues,
                                name: newName,
                                slug: wasAutoGenerated
                                  ? generateSlug(newName)
                                  : editingValues.slug,
                              });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none font-medium"
                            placeholder={t("form.namePlaceholder")}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            {t("form.slugLabel")}
                          </label>
                          <input
                            type="text"
                            value={editingValues.slug}
                            onChange={(e) => {
                              // Auto-format slug as user types
                              const formatted = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "-")
                                .replace(/-+/g, "-")
                                .replace(/(^-|-$)/g, "");
                              setEditingValues({
                                ...editingValues,
                                slug: formatted,
                              });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none font-mono"
                            placeholder={t("form.slugPlaceholder")}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {category.slug}
                        </p>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        {t("form.activeLabel")}
                      </label>
                      {editingId === category._id && editingValues ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingValues.isActive}
                            onChange={(e) =>
                              setEditingValues({
                                ...editingValues,
                                isActive: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                        </label>
                      ) : (
                        <button
                          onClick={() =>
                            handleToggleActive(category._id, category.isActive)
                          }
                          disabled={updating === category._id}
                          className={`relative inline-flex items-center cursor-pointer ${
                            updating === category._id ? "opacity-50" : ""
                          }`}
                        >
                          <div
                            className={`w-11 h-6 rounded-full transition-colors ${
                              category.isActive ? "bg-orange" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                                category.isActive ? "translate-x-full" : ""
                              }`}
                            />
                          </div>
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        {t("form.priorityLabel")}
                      </label>
                      {editingId === category._id && editingValues ? (
                        <input
                          type="number"
                          min="0"
                          value={editingValues.sortOrder}
                          onChange={(e) =>
                            setEditingValues({
                              ...editingValues,
                              sortOrder: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange focus:border-orange outline-none"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {category.sortOrder}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    {editingId === category._id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(category._id)}
                          disabled={updating === category._id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {updating === category._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>{t("buttons.save")}</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updating === category._id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>{t("buttons.cancel")}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>{t("buttons.edit")}</span>
                        </button>
                        {deleteConfirm === category._id ? (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 mb-2">
                              {t("messages.deleteConfirm")}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleDelete(category._id, category.slug)
                                }
                                disabled={deleting === category._id}
                                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {deleting === category._id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    {t("messages.deleting")}
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3" />
                                    {t("buttons.delete")}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting === category._id}
                                className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                              >
                                {t("buttons.cancel")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(category._id)}
                            disabled={deleting === category._id}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{t("buttons.delete")}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          {t("info.title")}
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            <strong>{t("info.nameSlugLabel")}:</strong> {t("info.nameSlugDesc")}
          </li>
          <li>
            <strong>{t("info.activeLabel")}:</strong> {t("info.activeDesc")}
          </li>
          <li>
            <strong>{t("info.priorityLabel")}:</strong> {t("info.priorityDesc")}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CategoriesPage;
