"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Get the current path without locale
    // pathname will be like /en/shop or /ar/shop
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.slice(`/${locale}`.length) || "/"
      : pathname;
    router.push(`/${newLocale}${pathWithoutLocale}`);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLocale("en")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === "en"
            ? "text-primary-400"
            : "text-[#C9C9C9] hover:text-white"
        }`}
      >
        English
      </button>
      <button
        onClick={() => switchLocale("ar")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === "ar" 
            ? "text-primary-400" 
            : "text-[#C9C9C9] hover:text-white"
        }`}
      >
        العربية
      </button>
    </div>
  );
}
