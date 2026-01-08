"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Determine the opposite locale
  const targetLocale = locale === "ar" ? "en" : "ar";
  const targetLabel = locale === "ar" ? "EN" : "AR";

  const switchLocale = () => {
    // Get the current path without locale
    // pathname will be like /en/shop or /ar/shop
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.slice(`/${locale}`.length) || "/"
      : pathname;
    router.push(`/${targetLocale}${pathWithoutLocale}`);
    router.refresh();
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-[#C9C9C9] hover:text-white hover:bg-white/10 border border-transparent hover:border-primary-500/30"
      title={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Globe className="w-4 h-4 text-primary-400" />
      <span className="font-semibold">{targetLabel}</span>
    </button>
  );
}
