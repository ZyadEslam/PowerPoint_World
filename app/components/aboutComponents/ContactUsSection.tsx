"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Instagram, Facebook } from "lucide-react";
import TikTokIcon from "../icons/TikTokIcon";

const ContactUsSection = () => {
  const t = useTranslations("about.contactUs");

  const socialLinks = [
    {
      name: t("instagram"),
      icon: Instagram,
      href: "https://www.instagram.com/espesyal_brand?igsh=MTg5M3VuNWVyenF6Nw==",
      gradient: "",
      hoverGradient: "",
      bgColor: "",
      iconColor: "text-pink-600",
    },
    {
      name: t("facebook"),
      icon: Facebook,
      href: "https://www.facebook.com/share/1CxWh2BmJ6/",
      gradient: "",
      hoverGradient: "",
      bgColor: "",
      iconColor: "text-blue-600",
    },

    {
      name: t("tiktok"),
      icon: TikTokIcon,
      href: "https://www.tiktok.com/@espesyalbrand_1?_t=8p7NIPbuJU1&_r=1",
      gradient: "from-gray-900 via-gray-800 to-gray-900",
      hoverGradient: "bg-gray-800",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-800",
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-orange/30 transition-all duration-300"
              aria-label={`${t("followUsOn")} ${social.name}`}
            >
              {/* Icon with gradient background on hover */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${social.bgColor} flex items-center justify-center group-hover:bg-gradient-to-br ${social.gradient} transition-all duration-300`}
              >
                <social.icon
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${social.iconColor}  transition-colors duration-300`}
                />
              </div>
              <span className="mt-2 text-xs sm:text-sm font-medium text-gray-700 group-hover:text-orange transition-colors duration-300">
                {social.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;
