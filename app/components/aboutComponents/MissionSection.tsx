"use client";
// import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

const MissionSection = () => {
  const t = useTranslations("about.mission");

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 underlined-header after:mx-auto">
          {t("title")}
        </h2>
        <div className="text-center">
          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed text-lg font-medium">
              {t("description")}
            </p>
          </div>
          {/* <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/downloaded/teamwork.svg"
              alt="Our Mission"
              fill
              className="object-fit object-bottom"
            />
          </div> */}
        </div>
      </div>
    </section>
  );
};
export default MissionSection;
