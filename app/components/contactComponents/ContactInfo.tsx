"use client";
import React from "react";
import { useTranslations } from "next-intl";
import LocationMap from "./LocationMap";

const ContactInfo = () => {
  const t = useTranslations("contact.info");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6 underlined-header">
          {t("title")}
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{t("phone")}</h3>
              <p className="text-gray-600">+201040431147</p>
              <p className="text-gray-600">+201144094269</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{t("email")}</h3>
              <p className="text-gray-600">Contact@zyadelbehiry@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{t("location")}</h3>
              <p className="text-gray-600">{t("address")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[300px] rounded-lg overflow-hidden">
        <LocationMap />
      </div>
    </div>
  );
};

export default ContactInfo;
