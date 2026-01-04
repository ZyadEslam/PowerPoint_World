import React, { useState } from "react";
import { Plus } from "lucide-react";
import { ProductFormData, ProductFormVariant } from "@/app/hooks/useProducts";
import { Category } from "@/app/hooks/useProducts";
import QuickCategoryForm from "./QuickCategoryForm";
import ProductVariantInputs from "./ProductVariantInputs";
import { useTranslations } from "next-intl";

interface ProductEditFormProps {
  formData: ProductFormData;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (data: ProductFormData) => void;
  onCategoryCreated?: (category: Category) => void;
  submitting: boolean;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({
  formData,
  categories,
  onSubmit,
  onCancel,
  onChange,
  onCategoryCreated,
  submitting,
}) => {
  const t = useTranslations("dashboard.productList.editModal");
  const tForm = useTranslations("dashboard.productList.editModal.form");
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const handleChange = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => {
    if (field === "category") {
      const selectedCategory = categories.find((c) => c._id === value);
      onChange({
        ...formData,
        category: value as string,
        categoryName: selectedCategory?.name || formData.categoryName,
      });
    } else {
      onChange({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleVariantsChange = (variants: ProductFormVariant[]) => {
    onChange({
      ...formData,
      variants,
    });
  };

  const handleCategoryCreated = async (
    categoryId: string,
    categoryName: string
  ) => {
    try {
      // Notify parent to refresh categories list first
      if (onCategoryCreated) {
        await onCategoryCreated({
          _id: categoryId,
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        });
      }

      // Update form data with new category after refresh
      onChange({
        ...formData,
        category: categoryId,
        categoryName: categoryName,
      });

      setShowCategoryForm(false);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {tForm("productNameRequired")}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {tForm("descriptionRequired")}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          required
          rows={4}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tForm("priceRequired")}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tForm("oldPrice")}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.oldPrice}
            onChange={(e) => handleChange("oldPrice", e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tForm("discount")}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) => handleChange("discount", e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tForm("ratingRequired")}
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={(e) => handleChange("rating", e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tForm("brandRequired")}
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tForm("categoryNameRequired")}
          </label>
          <input
            type="text"
            value={formData.categoryName}
            onChange={(e) => handleChange("categoryName", e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
          />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {tForm("categoryIdRequired")}
        </label>
        <div className="relative">
          <select
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 pr-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
          >
            <option value="">{tForm("selectCategory")}</option>
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
            title={tForm("addNewCategory")}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showCategoryForm && (
          <div className="relative">
            <QuickCategoryForm
              onCategoryCreated={handleCategoryCreated}
              onClose={() => setShowCategoryForm(false)}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <ProductVariantInputs
          variants={formData.variants}
          onChange={handleVariantsChange}
        />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.hideFromHome ?? false}
            onChange={(e) => handleChange("hideFromHome", e.target.checked)}
            className="w-5 h-5 text-orange border-gray-300 rounded focus:ring-2 focus:ring-orange focus:ring-offset-2"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              {t("hideFromHome")}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {t("hideFromHomeDesc")}
            </p>
          </div>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 text-sm sm:text-base bg-orange text-white rounded-lg hover:bg-orange/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {tForm("updating")}
            </span>
          ) : (
            tForm("updateProduct")
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductEditForm;
