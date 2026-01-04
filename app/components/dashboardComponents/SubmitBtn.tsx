"use client";

import React, { useContext } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { ProductFormContext } from "./ProductForm";

const SubmitBtn = React.memo(() => {
  const t = useTranslations("dashboard.addProduct");
  const { isLoading } = useContext(ProductFormContext);

  return (
    <div className="mt-4">
      <button
        type="submit"
        disabled={isLoading}
        className={`px-6 py-2 bg-orange text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
          isLoading
            ? "opacity-70 cursor-not-allowed"
            : "hover:bg-orange/90 cursor-pointer"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating product...</span>
          </>
        ) : (
          <span>{t("submit")}</span>
        )}
      </button>
    </div>
  );
});

SubmitBtn.displayName = "SubmitButton";

export default SubmitBtn;
