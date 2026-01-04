"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuickCategoryFormProps {
  onCategoryCreated: (categoryId: string, categoryName: string) => void;
  onClose: () => void;
}

const QuickCategoryForm: React.FC<QuickCategoryFormProps> = ({
  onCategoryCreated,
  onClose,
}) => {
  const t = useTranslations(
    "dashboard.productList.editModal.form.quickCategory"
  );
  const [categoryName, setCategoryName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!categoryName.trim()) {
      setError(t("nameRequired"));
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create category");
      }

      if (!result.success || !result.data) {
        throw new Error("Invalid response from server");
      }

      setSuccess(true);

      // Wait a moment to show success state, then call callback
      setTimeout(() => {
        onCategoryCreated(result.data._id, result.data.name);
        setCategoryName("");
        setCreating(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error("Error creating category:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
      setCreating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={creating}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {t("title")}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="category-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("categoryNameRequired")}
              </label>
              <input
                id="category-name"
                type="text"
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }
                }}
                placeholder={t("categoryNamePlaceholder")}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none transition-colors"
                disabled={creating || success}
                autoFocus
              />
              {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
                }}
                disabled={creating || success || !categoryName.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-orange text-white rounded-lg hover:bg-orange/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("creating")}</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t("created")}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t("addCategory")}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                disabled={creating}
                className="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickCategoryForm;
