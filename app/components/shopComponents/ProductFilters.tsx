"use client";
import React, { memo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CategoryProps } from "../../types/types";

interface ProductFiltersProps {
  categories: CategoryProps[];
  selectedCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
  isLoading?: boolean;
  className?: string;
}

const ProductFilters = memo(
  ({
    categories,
    selectedCategory,
    onCategoryChange,
    isLoading = false,
    className = "",
  }: ProductFiltersProps) => {
    const t = useTranslations("common");

    const handleCategoryChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onCategoryChange(value === "" ? null : value);
      },
      [onCategoryChange]
    );

    // Filter only active categories
    const activeCategories = categories.filter((cat) => cat.isActive);

    return (
      <div className={`${className}`}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t("filter")}</h2>

        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("category") || "Category"}
            </label>
            {isLoading ? (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 animate-pulse">
                <span className="text-gray-400">Loading categories...</span>
              </div>
            ) : (
              <select
                value={selectedCategory || ""}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange focus:border-orange bg-white"
              >
                <option value="">{t("allProducts") || "All Products"}</option>
                {activeCategories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProductFilters.displayName = "ProductFilters";

export default ProductFilters;
