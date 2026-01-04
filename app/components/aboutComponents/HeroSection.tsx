"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const HeroSection = () => {
  const t = useTranslations("about.hero");

  return (
    <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          <span className="text-orange">{t("title")}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>
      <div className="absolute inset-0 opacity-90">
        <Image
          src="/espesyal/product5.jpg"
          alt="About Us - Background"
          fill
          className="w-full h-full object-cover"
          priority
        />
      </div>
    </section>
  );
};

export default HeroSection;
