"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, Bell, User, Home, ChevronRight } from "lucide-react";
import { useDashboardMenu } from "@/app/context/dashboardMenuCtx";
import LanguageSwitcher from "../LanguageSwitcher";

// Breadcrumb configuration for dashboard pages
const breadcrumbConfig: Record<string, { key: string; parent?: string }> = {
  dashboard: { key: "dashboard" },
  templates: { key: "templates", parent: "dashboard" },
  new: { key: "addTemplate", parent: "templates" },
  categories: { key: "categories", parent: "dashboard" },
  payments: { key: "payments", parent: "dashboard" },
  downloads: { key: "downloads", parent: "dashboard" },
  "promo-codes": { key: "promoCodes", parent: "dashboard" },
  "admin-management": { key: "adminManagement", parent: "dashboard" },
  settings: { key: "settings", parent: "dashboard" },
  orders: { key: "orders", parent: "dashboard" },
  "hero-section": { key: "heroSection", parent: "dashboard" },
  "product-list": { key: "productList", parent: "dashboard" },
  "shipping-settings": { key: "shippingSettings", parent: "dashboard" },
};

const DashboardHeader = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("dashboard.header");
  const sidebarT = useTranslations("dashboard.sidebar.links");
  const isArabic = locale === "ar";
  const { setIsDashboardMenuOpen } = useDashboardMenu();

  // Parse the current path to generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    const segments = pathWithoutLocale.split("/").filter(Boolean);
    
    const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];
    let currentPath = `/${locale}`;
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = breadcrumbConfig[segment];
      const isLast = index === segments.length - 1;
      
      let label = segment;
      if (config) {
        // Try to get the translation from sidebar links
        const translated = sidebarT(config.key);
        if (translated && translated !== config.key) {
          label = translated;
        } else if (config.key === "dashboard") {
          label = t("dashboard") || "Dashboard";
        } else if (config.key === "addTemplate") {
          label = t("addTemplate") || "Add Template";
        }
      } else {
        // Capitalize and format segment
        label = segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }
      
      breadcrumbs.push({ label, href: currentPath, isLast });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsDashboardMenuOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            <Link
              href={`/${locale}`}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>{t("home") || "Home"}</span>
            </Link>
            
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight className={`w-4 h-4 text-gray-600 ${isArabic ? "rotate-180" : ""}`} />
                {crumb.isLast ? (
                  <span className="text-primary-400 font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 ps-3 border-s border-white/10">
            <div className={`hidden sm:block ${isArabic ? "text-left" : "text-right"}`}>
              <p className="text-sm font-medium text-white">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">
                {t("admin") || "Administrator"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Admin"}
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-black" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
