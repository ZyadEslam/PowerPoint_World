"use client";
import React from "react";
import { useTranslations } from "next-intl";

const AddressHeroSection = () => {
  const t = useTranslations("shipping");

  return (
    <section className="mt-5 ">
      <h2 className="text-3xl mb-6 underlined-header !after:mx-0">
        <span className="text-gray-500">{t("addNew")}</span>{" "}
        <span className="text-orange font-bold">{t("address")}</span>
      </h2>
    </section>
  );
};

export default AddressHeroSection;
