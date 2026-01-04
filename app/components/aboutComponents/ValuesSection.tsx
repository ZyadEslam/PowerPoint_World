"use client";
import { values } from "@/app/utils/staticData";
import React from "react";
import { useTranslations } from "next-intl";

const ValuesSection = () => {
  const t = useTranslations("about.values");
  const valueKeys = ["innovation", "quality", "customerFirst"];

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange to-orange/60 mx-auto rounded-full"></div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {values.map((value, index) => {
            const key = valueKeys[index];
            return (
              <div
                key={index}
                className="group relative"
              >
                <div className="h-full rounded-2xl p-8 sm:p-10 lg:p-12 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange/20 transition-all duration-300 transform hover:-translate-y-2">
                  {/* Content */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange transition-colors duration-300">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                    {t(`${key}.description`)}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
