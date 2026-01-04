"use client";
import React from "react";
import { useTranslations } from "next-intl";

const ContactForm = () => {
  const t = useTranslations("contact.form");

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 underlined-header !after:mx-0">
        {t("title")}
      </h2>
      <form className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("nameLabel")}
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
            placeholder={t("namePlaceholder")}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("emailLabel")}
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
            placeholder={t("emailPlaceholder")}
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("messageLabel")}
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
            placeholder={t("messagePlaceholder")}
          ></textarea>
        </div>
        <button className="w-full bg-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors">
          {t("submitButton")}
        </button>
      </form>
    </div>
  );
};
export default ContactForm;
