import React from "react";
import { useTranslations, useLocale } from "next-intl";

import FormInput from "./FormInput";
const PriceInputs = React.memo(() => {
  const t = useTranslations("dashboard.addProduct");
  const locale = useLocale();
  const direction = locale.startsWith("ar") ? "rtl" : "ltr";

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <FormInput
        id="price"
        name="price"
        label={t("priceLabel")}
        type="number"
        placeholder={t("pricePlaceholder")}
        min="0"
        step="0.01"
        required
        direction={direction as "ltr" | "rtl"}
      />
      <FormInput
        id="oldPrice"
        name="oldPrice"
        label={t("oldPriceLabel")}
        type="number"
        placeholder={t("pricePlaceholder")}
        min="0"
        step="0.01"
        direction={direction as "ltr" | "rtl"}
      />
      <FormInput
        id="discount"
        name="discount"
        label={t("discountLabel")}
        type="number"
        placeholder={t("pricePlaceholder")}
        min="0"
        step="0.01"
        direction={direction as "ltr" | "rtl"}
      />
      <FormInput
        id="rating"
        name="rating"
        label={t("ratingLabel")}
        type="number"
        placeholder={t("pricePlaceholder")}
        min="0"
        step="0.01"
        required
        direction={direction as "ltr" | "rtl"}
      />
    </div>
  );
});

PriceInputs.displayName = "PriceInputs";
export default PriceInputs;
