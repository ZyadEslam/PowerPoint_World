"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Phone, Mail, Heart, Sparkles } from "lucide-react";
import { Instagram, Facebook } from "lucide-react";
import TikTokIcon from "./icons/TikTokIcon";

// Decorative shapes component matching hero section style
const FooterShapes = () => (
  <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden pointer-events-none hidden md:block">
    {/* Elegant Curved Lines */}
    <svg
      className="absolute top-[20%] right-[10%] w-40 h-40 opacity-15 animate-float"
      viewBox="0 0 100 100"
      fill="none"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        className="stroke-primary-200"
        strokeWidth="1"
        fill="none"
        strokeDasharray="10 5"
      />
      <circle
        cx="50"
        cy="50"
        r="30"
        className="stroke-primary-200"
        strokeWidth="1"
        fill="none"
      />
    </svg>

    {/* Shopping Tag */}
    <svg
      className="absolute bottom-[30%] right-[20%] w-20 h-24 opacity-20 animate-float-delayed"
      viewBox="0 0 80 100"
      fill="none"
    >
      <path
        d="M10 25 L40 5 L70 25 L70 90 C70 95 65 100 60 100 L20 100 C15 100 10 95 10 90 Z"
        fill="url(#tagGradient)"
        className="stroke-primary-200"
        strokeWidth="1.5"
      />
      <circle
        cx="40"
        cy="35"
        r="8"
        fill="none"
        className="stroke-primary-200"
        strokeWidth="2"
      />
      <defs>
        <linearGradient id="tagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            className="[stop-color:var(--color-primary-200)]"
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            className="[stop-color:var(--color-primary-400)]"
            stopOpacity="0.15"
          />
        </linearGradient>
      </defs>
    </svg>

    {/* Decorative circles */}
    <div className="absolute top-[40%] right-[5%] w-4 h-4 rounded-full bg-primary-400/30 animate-pulse" />
    <div
      className="absolute top-[60%] right-[35%] w-3 h-3 rounded-full bg-secondary-400/40 animate-pulse"
      style={{ animationDelay: "0.5s" }}
    />
    <div
      className="absolute bottom-[20%] right-[8%] w-5 h-5 rounded-full bg-primary-300/25 animate-pulse"
      style={{ animationDelay: "1s" }}
    />
  </div>
);

const Footer = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tHome = useTranslations("home");
  const isDashboard = pathname?.includes("/dashboard");
  const isRTL = locale === "ar";

  if (isDashboard) return null;

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/espesyal_brand?igsh=MTg5M3VuNWVyenF6Nw==",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://www.facebook.com/share/1CxWh2BmJ6/",
    },
    {
      name: "TikTok",
      icon: TikTokIcon,
      href: "https://www.tiktok.com/@espesyalbrand_1?_t=8p7NIPbuJU1&_r=1",
    },
  ];

  return (
    <footer className="footer-section relative overflow-hidden w-full">
      {/* Creative Gradient Background - Matching Hero Section */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-700" />

      {/* Warm overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-800/40 via-transparent to-primary-700/40" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-300/20 rounded-full blur-3xl" />

      {/* Mesh pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary-300) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative Shapes */}
      <FooterShapes />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-center container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 min-h-screen">
        {/* Top Section - Brand & Tagline */}
        <div className="text-center mb-16 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-primary-500/20 to-primary-600/20 backdrop-blur-md rounded-full border border-primary-400/30 shadow-xl mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm md:text-base font-bold text-[var(--text-light)] tracking-wider uppercase">
              Espesyal Shop
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-light)] leading-tight mb-4">
            <span className="bg-gradient-to-r from-white via-primary-100 to-primary-200 bg-clip-text text-transparent">
              {t("thankYouForVisiting")}
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto">
            {t("stayConnected")}
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-primary-400 rounded-full"></div>
            <div className="h-2 w-2 bg-primary-400 rounded-full shadow-lg shadow-primary-400/50"></div>
            <div className="h-1 w-16 bg-gradient-to-r from-primary-400 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {/* Services Column */}
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-[var(--text-light)] flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-primary-400 to-transparent rounded-full"></div>
              {t("services")}
            </h3>
            <div className="space-y-3">
              {[
                t("fastShipping"),
                t("styleAdvice"),
                t("giftCards"),
                t("sizeGuide"),
                t("orderTracking"),
              ].map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-400/60 rounded-full"></div>
                  <span className="text-white/70 text-sm hover:text-white transition-colors">
                    {service}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h3 className="text-xl font-bold text-[var(--text-light)] flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-primary-400 to-transparent rounded-full"></div>
              {t("links")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: tNav("home") },
                { href: "/about", label: tNav("about") },
                { href: "/shop", label: tNav("shop") },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={getLocalizedPath(link.href)}
                    className="group flex items-center gap-2 text-white/70 hover:text-[var(--text-light)] transition-all duration-300"
                  >
                    <span className="w-0 h-0.5 bg-primary-400 group-hover:w-4 transition-all duration-300 rounded-full"></span>
                    <span className="text-sm">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h3 className="text-xl font-bold text-[var(--text-light)] flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-primary-400 to-transparent rounded-full"></div>
              {t("contact")}
            </h3>
            <div className="space-y-4">
              {/* Phone */}
              <a
                href="tel:+201080972324"
                className="group flex items-center gap-3 text-white/70 hover:text-[var(--text-light)] transition-all duration-300"
              >
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary-500/20 group-hover:border-primary-400/30 transition-all duration-300">
                  <Phone className="w-4 h-4 white" />
                </div>
                <span className="text-sm">+201080972324</span>
              </a>

              {/* Email */}
              <a
                href="mailto:espesyaleg@gmail.com"
                className="group flex items-center gap-3 text-white/70 hover:text-[var(--text-light)] transition-all duration-300"
              >
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary-500/20 group-hover:border-primary-400/30 transition-all duration-300">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm break-all">espesyaleg@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Payment & Social Column */}
          <div
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="text-xl font-bold text-[var(--text-light)] flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-primary-400 to-transparent rounded-full"></div>
              {t("paymentMethods")}
            </h3>
            <div className="flex gap-3">
              {/* Visa */}
              <div className="flex items-center justify-center w-16 h-10 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 ">
                <span className="text-sm font-bold text-white">VISA</span>
              </div>
              {/* Cash */}
              <div className="flex items-center justify-center w-16 h-10 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 ">
                <span className="text-sm font-bold text-white">CASH</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4">
              <p className="text-sm text-white/50 mb-3">
                {tHome("followUsNow")}
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-110"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4 text-white/80 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50 flex items-center gap-2">
              © {new Date().getFullYear()} Espesyal Shop.{" "}
              {t("allRightsReserved")}
            </p>
            <p className="text-sm text-white/40 flex items-center gap-1">
              Made with{" "}
              <Heart className="w-3 h-3 text-primary-400 fill-primary-400" /> in
              Egypt
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
