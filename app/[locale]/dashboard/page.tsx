"use client";
import React, { useState, useCallback, memo, useMemo } from "react";
import { assets } from "@/public/assets/assets";
import ImageUploader, {
  ImageState,
} from "../../components/dashboardComponents/ImageUploader";
import FormInput from "../../components/dashboardComponents/FormInput";
import CategorySelect from "../../components/dashboardComponents/CategorySelect";
import PriceInputs from "../../components/dashboardComponents/PriceInputs";
import SubmitButton from "../../components/dashboardComponents/SubmitBtn";
import ProductForm from "../../components/dashboardComponents/ProductForm";
import ProductVariantInputs from "../../components/dashboardComponents/ProductVariantInputs";
import type { ProductFormVariant } from "@/app/hooks/useProducts";
import { Plus } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const DashboardPage = memo(() => {
  const t = useTranslations("dashboard.addProduct");
  const locale = useLocale();
  const direction = locale.startsWith("ar") ? "rtl" : "ltr";

  const [images, setImages] = useState<ImageState>({
    image1: assets.upload_area,
    image2: assets.upload_area,
    image3: assets.upload_area,
    image4: assets.upload_area,
  });
  const createVariantRow = (): ProductFormVariant => ({
    clientId:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    color: "",
    size: "",
    quantity: "",
    sku: "",
  });
  const [variants, setVariants] = useState<ProductFormVariant[]>([
    createVariantRow(),
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [formResetKey, setFormResetKey] = useState<number>(0);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        setImages((prev) => ({
          ...prev,
          [imageKey]: imageUrl,
        }));
      }
    },
    []
  );

  const removeImageHandler = useCallback((imageKey: string) => {
    setImages((prev) => {
      // Clean up blob URL before removing to prevent memory leaks
      const currentImage = prev[imageKey as keyof ImageState];
      if (typeof currentImage === "string" && currentImage.startsWith("blob:")) {
        URL.revokeObjectURL(currentImage);
      }
      return {
        ...prev,
        [imageKey]: assets.upload_area,
      };
    });
  }, []);

  const serializedVariants = useMemo(
    () =>
      JSON.stringify(
        variants
          .filter((variant) => variant.color && variant.size)
          .map((variant) => {
            const sanitized = { ...variant };
            delete sanitized.clientId;
            return sanitized;
          })
      ),
    [variants]
  );

  const handleFormReset = useCallback(() => {
    // Clean up any blob URLs before resetting
    setImages((prev) => {
      Object.values(prev).forEach((image) => {
        if (typeof image === "string" && image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
      return {
        image1: assets.upload_area,
        image2: assets.upload_area,
        image3: assets.upload_area,
        image4: assets.upload_area,
      };
    });
    // Reset variants to one empty row
    setVariants([createVariantRow()]);
    // Reset category
    setSelectedCategory("");
    // Increment reset key to trigger file input clearing
    setFormResetKey((prev) => prev + 1);
  }, []);

  return (
    <div className="max-w-6xl ">
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

      <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <ProductForm onFormReset={handleFormReset}>
            <ImageUploader
              images={images}
              onImageChange={handleImageChange}
              onRemoveImage={removeImageHandler}
              resetKey={formResetKey}
            />

            <div className="space-y-6">
              <FormInput
                id="name"
                name="name"
                label={t("nameLabel")}
                type="text"
                placeholder={t("namePlaceholder")}
                required
                direction={direction as "ltr" | "rtl"}
              />

              <FormInput
                id="description"
                name="description"
                label={t("descriptionLabel")}
                type="textarea"
                placeholder={t("descriptionPlaceholder")}
                required
                rows={4}
                direction={direction as "ltr" | "rtl"}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CategorySelect
                  id="category"
                  name="category"
                  label={t("categoryLabel")}
                  placeholder={t("categoryPlaceholder")}
                  required
                  direction={direction as "ltr" | "rtl"}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
                <FormInput
                  id="brand"
                  name="brand"
                  label={t("brandLabel")}
                  type="text"
                  placeholder={t("brandPlaceholder")}
                  required
                  direction={direction as "ltr" | "rtl"}
                />
              </div>

              <PriceInputs />

              <div className="space-y-4">
                <ProductVariantInputs
                  variants={variants}
                  onChange={setVariants}
                />
                <input
                  type="hidden"
                  name="variants"
                  value={serializedVariants}
                />
              </div>

              <div className="pt-6 border-t border-gray-200">
                <SubmitButton />
              </div>
            </div>
          </ProductForm>
        </div>
      </div>
    </div>
  );
});

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
