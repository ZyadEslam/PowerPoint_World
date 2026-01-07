"use client";

import { useEffect } from "react";

interface LocaleProviderProps {
  locale: string;
  children: React.ReactNode;
}

export default function LocaleProvider({
  locale,
  children,
}: LocaleProviderProps) {
  useEffect(() => {
    // Update html element attributes based on locale
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
