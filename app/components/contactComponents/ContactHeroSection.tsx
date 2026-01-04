"use client";
import React from "react";
import { useTranslations } from "next-intl";

const ContactHeroSection = () => {
  const t = useTranslations("contact.hero");

  return (
    <section className="relative h-[40vh] flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-orange">{t("title")}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
};
export default ContactHeroSection;
