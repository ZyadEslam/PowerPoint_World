"use client";
import React, { memo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CategoryProps } from "../../types/types";

interface CategoryFilterProps {
  categories: CategoryProps[];
  selectedCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
  className?: string;
}

const CategoryFilter = memo(
  ({
    categories,
    selectedCategory,
    onCategoryChange,
    className = "",
  }: CategoryFilterProps) => {
    const t = useTranslations("common");
    const handleCategoryClick = useCallback(
      (slug: string | null) => {
        onCategoryChange(slug);
      },
      [onCategoryChange]
    );

    return (
      <div className={`${className}`}>
        <nav className="flex space-x-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? "bg-orange text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {t("allProducts")}
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category.slug)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.slug
                  ? "bg-orange text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>
    );
  }
);

CategoryFilter.displayName = "CategoryFilter";

export default CategoryFilter;
