"use client";
import React from "react";
import { Instagram, Facebook, Sparkles, Heart, Star } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import TikTokIcon from "../icons/TikTokIcon";
import Image from "next/image";

// Decorative shapes component matching hero section style
const SocialShapes = () => (
  <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden pointer-events-none hidden md:block">
    {/* Floating Hearts */}
    <svg
      className="absolute top-[15%] left-[20%] w-16 h-16 opacity-20 animate-float"
      viewBox="0 0 60 60"
      fill="none"
    >
      <path
        d="M30 50 C15 35 5 25 5 15 C5 8 10 3 17 3 C22 3 27 7 30 12 C33 7 38 3 43 3 C50 3 55 8 55 15 C55 25 45 35 30 50Z"
        fill="url(#heartGradient)"
        className="stroke-primary-200"
        strokeWidth="1"
      />
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            className="[stop-color:var(--color-primary-200)]"
            stopOpacity="0.5"
          />
          <stop
            offset="100%"
            className="[stop-color:var(--color-primary-400)]"
            stopOpacity="0.25"
          />
        </linearGradient>
      </defs>
    </svg>

    {/* Star Shape */}
    <svg
      className="absolute top-[40%] left-[10%] w-20 h-20 opacity-15 animate-float-delayed"
      viewBox="0 0 80 80"
      fill="none"
    >
      <path
        d="M40 5 L47 30 L73 30 L52 48 L60 73 L40 57 L20 73 L28 48 L7 30 L33 30 Z"
        fill="url(#starGradient)"
        className="stroke-primary-200"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            className="[stop-color:var(--color-secondary-400)]"
            stopOpacity="0.4"
          />
          <stop
            offset="100%"
            className="[stop-color:var(--color-secondary-500)]"
            stopOpacity="0.2"
          />
        </linearGradient>
      </defs>
    </svg>

    {/* Gift Box */}
    <svg
      className="absolute bottom-[25%] left-[25%] w-24 h-28 opacity-20 animate-float"
      viewBox="0 0 90 100"
      fill="none"
    >
      <rect
        x="10"
        y="30"
        width="70"
        height="65"
        rx="4"
        fill="url(#giftGradient)"
        className="stroke-primary-200"
        strokeWidth="2"
      />
      <rect
        x="5"
        y="20"
        width="80"
        height="15"
        rx="3"
        fill="url(#giftLidGradient)"
        className="stroke-primary-200"
        strokeWidth="2"
      />
      <path d="M45 20 L45 95" className="stroke-primary-300" strokeWidth="3" />
      <path
        d="M45 20 C35 10 25 15 25 20 M45 20 C55 10 65 15 65 20"
        className="stroke-primary-200"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="giftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
        <linearGradient
          id="giftLidGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            className="[stop-color:var(--color-primary-200)]"
            stopOpacity="0.4"
          />
          <stop
            offset="100%"
            className="[stop-color:var(--color-primary-400)]"
            stopOpacity="0.2"
          />
        </linearGradient>
      </defs>
    </svg>

    {/* Camera/Phone Shape for Social Media */}
    <svg
      className="absolute bottom-[45%] left-[5%] w-18 h-24 opacity-25 animate-float-delayed"
      viewBox="0 0 70 100"
      fill="none"
    >
      <rect
        x="5"
        y="5"
        width="60"
        height="90"
        rx="10"
        fill="none"
        className="stroke-secondary-300"
        strokeWidth="2"
      />
      <circle
        cx="35"
        cy="85"
        r="6"
        fill="none"
        className="stroke-secondary-300"
        strokeWidth="2"
      />
      <rect
        x="10"
        y="15"
        width="50"
        height="55"
        rx="3"
        fill="url(#phoneGradient)"
        className="stroke-secondary-300"
        strokeWidth="1"
      />
      <defs>
        <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            className="[stop-color:var(--color-secondary-400)]"
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            className="[stop-color:var(--color-secondary-500)]"
            stopOpacity="0.15"
          />
        </linearGradient>
      </defs>
    </svg>

    {/* Decorative circles */}
    <div className="absolute top-[25%] left-[35%] w-4 h-4 rounded-full bg-primary-400/30 animate-pulse" />
    <div
      className="absolute top-[55%] left-[15%] w-3 h-3 rounded-full bg-secondary-400/40 animate-pulse"
      style={{ animationDelay: "0.5s" }}
    />
    <div
      className="absolute bottom-[35%] left-[40%] w-5 h-5 rounded-full bg-primary-300/25 animate-pulse"
      style={{ animationDelay: "1s" }}
    />
    <div
      className="absolute top-[10%] left-[8%] w-2 h-2 rounded-full bg-secondary-300/50 animate-pulse"
      style={{ animationDelay: "1.5s" }}
    />

    {/* Floating sparkle lines */}
    <svg
      className="absolute top-[65%] left-[30%] w-16 h-16 opacity-25 animate-float"
      viewBox="0 0 60 60"
      fill="none"
    >
      <path
        d="M30 5 L30 15 M30 45 L30 55 M5 30 L15 30 M45 30 L55 30 M12 12 L20 20 M40 40 L48 48 M12 48 L20 40 M40 20 L48 12"
        className="stroke-primary-200"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const SubscriptionOffer = () => {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/espesyal_brand?igsh=MTg5M3VuNWVyenF6Nw==",
      gradient: "from-pink-500 to-purple-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://www.facebook.com/share/1CxWh2BmJ6/",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      name: "TikTok",
      icon: TikTokIcon,
      href: "https://www.tiktok.com/@espesyalbrand_1?_t=8p7NIPbuJU1&_r=1",
      gradient: "from-gray-800 to-gray-900",
    },
  ];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden w-full shadow-2xl"
    >
      {/* Creative Gradient Background - Matching Hero Section */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-700" />

      {/* Warm overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-l from-primary-700/60 via-transparent to-secondary-600/40" />

      {/* Subtle radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-secondary-300/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/15 rounded-full blur-3xl" />

      {/* Mesh pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary-300) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative Shapes - Left Side */}
      <SocialShapes />

      {/* Content Container */}
      <div className="relative z-10 w-full container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24 min-h-[80vh]">
          {/* Text Side */}
          <div className="max-w-xl flex flex-col justify-around space-y-6 md:space-y-8 animate-fade-in items-center text-center md:items-start md:text-start">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-primary-500/20 to-primary-600/20 backdrop-blur-md rounded-full border border-primary-400/30 shadow-xl`}
            >
              <div className="relative">
                <span className="absolute inset-0 bg-primary-400 rounded-full blur-md opacity-60 animate-pulse"></span>
                <Sparkles className="relative w-4 h-4 text-primary-400" />
              </div>
              <span className="text-sm md:text-base font-bold text-white tracking-wider uppercase">
                {t("followUsNow")}
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1]">
                <span className="block bg-gradient-to-r from-white via-primary-100 to-primary-200 bg-clip-text text-transparent">
                  {t("followUsForOffers")}
                </span>
                <span className="block mt-2 bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
                  {t("exclusiveOffers")}
                </span>
              </h2>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="h-1 w-16 bg-gradient-to-r from-primary-400 to-transparent rounded-full"></div>
                <div className="h-2 w-2 bg-primary-400 rounded-full shadow-lg shadow-primary-400/50"></div>
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary-400/50 to-transparent rounded-full"></div>
              </div>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-md">
              {t("joinSocialMedia")}
            </p>

            {/* Social Icons - Modern styling matching Hero */}
            <div className={`flex items-center gap-4 md:gap-5 pt-4`}>
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  aria-label={`${t("followUsOn")} ${social.name}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${social.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
                  ></div>

                  {/* Button */}
                  <div className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-hover:bg-white/20 group-hover:border-white/40 active:scale-95">
                    <social.icon className="h-6 w-6 md:h-7 md:w-7 text-white transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Label */}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>

            {/* Stats or Extra Info */}
            <div className="flex items-center gap-6 pt-6 opacity-80">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-white/60">10K+ Followers</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-white/60">Daily Updates</span>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div
            className={`flex items-center justify-center animate-fade-in-up-delay `}
          >
            <div className="relative">
              {/* Decorative ring behind image */}
              <div className="absolute inset-0 -m-4 md:-m-8 rounded-full border-2 border-primary-500/20 animate-pulse"></div>
              <div className="absolute inset-0 -m-8 md:-m-16 rounded-full border border-primary-400/10"></div>

              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl scale-110"></div>

              <Image
                src="/espesyal/متفرغ 1 تعديل.png"
                alt="Subscription Offer"
                width={500}
                height={500}
                className="relative z-10 drop-shadow-2xl object-contain max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[500px] h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionOffer;
