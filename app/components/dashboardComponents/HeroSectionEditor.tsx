"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Home,
  Save,
  Globe,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface HeroContent {
  heroBadge: string;
  largestSale: string;
  useCode: string;
  forDiscount: string;
  promoCode: string;
  locale: "en" | "ar";
}

const HeroSectionEditor = React.memo(() => {
  const currentLocale = useLocale();
  const t = useTranslations("dashboard.heroSectionEditor");
  const [activeLocale, setActiveLocale] = useState<"en" | "ar">(
    (currentLocale as "en" | "ar") || "en"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<HeroContent>({
    heroBadge: "",
    largestSale: "",
    useCode: "",
    forDiscount: "",
    promoCode: "",
    locale: activeLocale,
  });

  // Fetch hero content
  const fetchHeroContent = useCallback(async (locale: "en" | "ar", bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);

      // Add cache-busting timestamp parameter when bypassing cache (e.g., after saving)
      // This ensures we get fresh data from the server by bypassing browser cache
      const cacheBuster = bypassCache ? `&_t=${Date.now()}` : "";
      const response = await fetch(`/api/hero-section?locale=${locale}${cacheBuster}`);
      const result = await response.json();

      if (result.success && result.data) {
        setFormData(result.data);
      } else {
        throw new Error(result.error || t("loadError"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchHeroContent(activeLocale);
  }, [activeLocale, fetchHeroContent]);

  // Handle locale change
  const handleLocaleChange = (locale: "en" | "ar") => {
    setActiveLocale(locale);
    setError(null);
    setSuccess(null);
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation
      if (
        !formData.heroBadge.trim() ||
        !formData.largestSale.trim() ||
        !formData.useCode.trim() ||
        !formData.forDiscount.trim() ||
        !formData.promoCode.trim()
      ) {
        setError(t("allFieldsRequired"));
        return;
      }

      try {
        setSaving(true);
        setError(null);
        setSuccess(null);

        const response = await fetch("/api/hero-section", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            locale: activeLocale,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || t("updateError"));
        }

        setSuccess(t("updateSuccess"));
        // Refetch with cache bypass to ensure we get the latest data
        await fetchHeroContent(activeLocale, true);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("updateError"));
      } finally {
        setSaving(false);
      }
    },
    [formData, activeLocale, fetchHeroContent, t]
  );

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange/10 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-orange" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Language Selector */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-orange" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t("selectLanguage")}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleLocaleChange("en")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeLocale === "en"
                  ? "bg-orange text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("english")}
            </button>
            <button
              onClick={() => handleLocaleChange("ar")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeLocale === "ar"
                  ? "bg-orange text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("arabic")}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hero Badge */}
              <div className="space-y-2">
                <label
                  htmlFor="heroBadge"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("heroBadge")}
                </label>
                <input
                  id="heroBadge"
                  name="heroBadge"
                  type="text"
                  value={formData.heroBadge}
                  onChange={handleInputChange}
                  className="dashboard-input w-full"
                  placeholder={t("heroBadgePlaceholder")}
                  required
                />
              </div>

              {/* Largest Sale */}
              <div className="space-y-2">
                <label
                  htmlFor="largestSale"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("mainHeading")}
                </label>
                <textarea
                  id="largestSale"
                  name="largestSale"
                  value={formData.largestSale}
                  onChange={handleInputChange}
                  className="dashboard-input w-full min-h-[80px] resize-y"
                  placeholder={t("mainHeadingPlaceholder")}
                  required
                />
              </div>

              {/* Use Code */}
              <div className="space-y-2">
                <label
                  htmlFor="useCode"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("useCodeText")}
                </label>
                <input
                  id="useCode"
                  name="useCode"
                  type="text"
                  value={formData.useCode}
                  onChange={handleInputChange}
                  className="dashboard-input w-full"
                  placeholder={t("useCodePlaceholder")}
                  required
                />
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <label
                  htmlFor="promoCode"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("promoCode")}
                </label>
                <input
                  id="promoCode"
                  name="promoCode"
                  type="text"
                  value={formData.promoCode}
                  onChange={handleInputChange}
                  className="dashboard-input w-full uppercase"
                  placeholder={t("promoCodePlaceholder")}
                  required
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              {/* For Discount */}
              <div className="space-y-2">
                <label
                  htmlFor="forDiscount"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("discountText")}
                </label>
                <input
                  id="forDiscount"
                  name="forDiscount"
                  type="text"
                  value={formData.forDiscount}
                  onChange={handleInputChange}
                  className="dashboard-input w-full"
                  placeholder={t("discountTextPlaceholder")}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-orange text-white font-medium rounded-md hover:bg-orange/90 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t("saveChanges")}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
});

HeroSectionEditor.displayName = "HeroSectionEditor";

export default HeroSectionEditor;
