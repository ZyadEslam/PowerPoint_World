"use client";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("shipping.submit");

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? t("saving") : t("saveAddress")}
    </button>
  );
}
