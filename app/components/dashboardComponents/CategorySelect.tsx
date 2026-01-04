"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import QuickCategoryForm from "./QuickCategoryForm";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategorySelectProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  direction?: "ltr" | "rtl";
  value?: string;
  onChange?: (value: string) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  id,
  name,
  label,
  placeholder,
  required = false,
  direction = "ltr",
  value,
  onChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value ?? "");

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryCreated = async (
    categoryId: string,
    categoryName: string
  ) => {
    // Immediately add the new category to the list for instant UI update
    const newCategory: Category = {
      _id: categoryId,
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    };
    
    // Add to state immediately (check for duplicates first)
    setCategories((prev) => {
      // Check if category already exists
      if (prev.some((cat) => cat._id === categoryId)) {
        return prev;
      }
      return [...prev, newCategory];
    });
    setSelectedValue(categoryId);
    onChange?.(categoryId);
    setShowCategoryForm(false);

    // Then refresh categories list in the background with cache-busting
    try {
      const response = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await response.json();

      if (data.success && data.data) {
        // Update with fresh data from server (this will include the new category)
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error refreshing categories:", error);
      // If refresh fails, keep the manually added category
    }
  };

  const labelClass = `text-sm font-medium text-gray-700 ${
    direction === "rtl" ? "block text-right" : ""
  }`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          className="dashboard-input pr-10"
          required={required}
          dir={direction}
          value={value !== undefined ? value : selectedValue}
          onChange={(e) => {
            const newValue = e.target.value;
            if (value === undefined) {
              setSelectedValue(newValue);
            }
            onChange?.(newValue);
          }}
        >
          <option value="">{placeholder}</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowCategoryForm(!showCategoryForm);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-orange hover:bg-orange/10 rounded-md transition-colors"
          title="Add new category"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showCategoryForm && (
        <QuickCategoryForm
          onCategoryCreated={handleCategoryCreated}
          onClose={() => setShowCategoryForm(false)}
        />
      )}
    </div>
  );
};

export default CategorySelect;
