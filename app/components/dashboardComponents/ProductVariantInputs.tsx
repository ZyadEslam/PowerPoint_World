"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ProductFormVariant } from "@/app/hooks/useProducts";
import { useTranslations } from "next-intl";

interface ProductVariantInputsProps {
  variants: ProductFormVariant[];
  onChange: (variants: ProductFormVariant[]) => void;
  title?: string;
  description?: string;
  minRows?: number;
}

const createEmptyVariant = (): ProductFormVariant => ({
  clientId:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  color: "",
  size: "",
  quantity: "",
  sku: "",
});

const ProductVariantInputs: React.FC<ProductVariantInputsProps> = ({
  variants,
  onChange,
  title,
  description,
  minRows = 1,
}) => {
  const t = useTranslations("dashboard.productList.editModal.form.variants");
  const defaultTitle = title || t("title");
  const defaultDescription = description || t("description");

  const handleVariantChange = <K extends keyof ProductFormVariant>(
    index: number,
    field: K,
    value: ProductFormVariant[K]
  ) => {
    const updated = variants.map((variant, idx) =>
      idx === index ? { ...variant, [field]: value } : variant
    );
    onChange(updated);
  };

  const handleAddVariant = () => {
    onChange([...variants, createEmptyVariant()]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= minRows) return;
    onChange(variants.filter((_, idx) => idx !== index));
  };

  const totalStock = variants.reduce(
    (sum, variant) => sum + (Number(variant.quantity) || 0),
    0
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {defaultTitle}
            </h3>
            <p className="text-sm text-gray-500">{defaultDescription}</p>
          </div>
          <div className="text-sm text-gray-600">
            {t("totalStock")}{" "}
            <span className="font-semibold text-gray-900">{totalStock}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div
            key={
              variant.clientId ||
              variant._id ||
              `${variant.size}-${variant.color}-${index}`
            }
            className="p-4 border border-gray-200 rounded-xl bg-gray-50/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t("variantNumber")}
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                disabled={variants.length <= minRows}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 disabled:text-gray-300"
              >
                <Trash2 className="w-4 h-4" />
                {t("remove")}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("colorRequired")}
                </label>
                <input
                  type="text"
                  required
                  value={variant.color}
                  onChange={(e) =>
                    handleVariantChange(index, "color", e.target.value)
                  }
                  placeholder={t("colorPlaceholder")}
                  className="dashboard-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("sizeRequired")}
                </label>
                <input
                  type="text"
                  required
                  value={variant.size}
                  onChange={(e) =>
                    handleVariantChange(index, "size", e.target.value)
                  }
                  placeholder={t("sizePlaceholder")}
                  className="dashboard-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("quantityRequired")}
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={variant.quantity}
                  onChange={(e) =>
                    handleVariantChange(index, "quantity", e.target.value)
                  }
                  placeholder={t("quantityPlaceholder")}
                  className="dashboard-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("sku")}
                </label>
                <input
                  type="text"
                  value={variant.sku || ""}
                  onChange={(e) =>
                    handleVariantChange(index, "sku", e.target.value)
                  }
                  placeholder={t("skuPlaceholder")}
                  className="dashboard-input"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddVariant}
        className="inline-flex items-center gap-2 text-sm font-medium text-orange hover:text-orange/80"
      >
        <Plus className="w-4 h-4" />
        {t("addAnother")}
      </button>
    </div>
  );
};

export default ProductVariantInputs;
