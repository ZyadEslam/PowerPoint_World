import React from "react";
import { X } from "lucide-react";
import { Product } from "@/app/hooks/useProducts";
import { useTranslations } from "next-intl";

interface ProductViewModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  product,
  onClose,
}) => {
  const t = useTranslations("dashboard.productList.viewModal");
  const tCommon = useTranslations("common");
  if (!product) return null;

  const totalStock =
    product.totalStock ??
    product.variants?.reduce(
      (sum, variant) => sum + (variant.quantity || 0),
      0
    ) ??
    0;

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
            aria-label={t("close")}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("name")}
            </label>
            <p className="mt-1 text-gray-900">{product.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <p className="mt-1 text-gray-900">{product.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("price")}
              </label>
              <p className="mt-1 text-gray-900">
                {product.price.toFixed(2)} {tCommon("currency")}
              </p>
            </div>
            {product.oldPrice && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("oldPrice")}
                </label>
                <p className="mt-1 text-gray-900">
                  {product.oldPrice.toFixed(2)} {tCommon("currency")}
                </p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("brand")}
              </label>
              <p className="mt-1 text-gray-900">{product.brand}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("category")}
              </label>
              <p className="mt-1 text-gray-900">{product.categoryName}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("rating")}
              </label>
              <p className="mt-1 text-gray-900">{product.rating} ★</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("images")}
              </label>
              <p className="mt-1 text-gray-900">{product.imageCount || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("totalStock")}
              </label>
              <p className="mt-1 text-gray-900">{totalStock}</p>
            </div>
          </div>
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("variants")}
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 bg-gray-50 text-xs font-semibold text-gray-600">
                  <span className="px-3 py-2">{t("color")}</span>
                  <span className="px-3 py-2">{t("size")}</span>
                  <span className="px-3 py-2">{t("quantity")}</span>
                  <span className="px-3 py-2">{t("sku")}</span>
                </div>
                {product.variants.map((variant) => (
                  <div
                    key={variant._id}
                    className="grid grid-cols-4 text-sm text-gray-900 border-t border-gray-100"
                  >
                    <span className="px-3 py-2 capitalize">
                      {variant.color}
                    </span>
                    <span className="px-3 py-2 uppercase">{variant.size}</span>
                    <span className="px-3 py-2">{variant.quantity}</span>
                    <span className="px-3 py-2 text-gray-500">
                      {variant.sku || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
