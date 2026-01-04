import React from "react";
import { X } from "lucide-react";
import { ProductFormData, Category } from "@/app/hooks/useProducts";
import ProductEditForm from "./ProductEditForm";
import { useTranslations } from "next-intl";

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProductFormData;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (data: ProductFormData) => void;
  onCategoryCreated?: (category: Category) => void;
  submitting: boolean;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  formData,
  categories,
  onSubmit,
  onCancel,
  onChange,
  onCategoryCreated,
  submitting,
}) => {
  const t = useTranslations("dashboard.productList.editModal");
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("title")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label={t("cancel")}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <ProductEditForm
          formData={formData}
          categories={categories}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onChange={onChange}
          onCategoryCreated={onCategoryCreated}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default ProductEditModal;
