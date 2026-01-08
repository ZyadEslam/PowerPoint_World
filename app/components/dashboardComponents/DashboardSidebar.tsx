"use client";

import React, { memo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  CreditCard,
  Download,
  Tag,
  Users,
  Settings,
  X,
  ChevronRight,
} from "lucide-react";
import { useDashboardMenu } from "@/app/context/dashboardMenuCtx";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    translationKey: "overview",
    exact: true,
  },
  {
    href: "/dashboard/templates",
    icon: FileText,
    translationKey: "templates",
  },
  {
    href: "/dashboard/categories",
    icon: FolderTree,
    translationKey: "categories",
  },
  {
    href: "/dashboard/payments",
    icon: CreditCard,
    translationKey: "payments",
  },
  {
    href: "/dashboard/downloads",
    icon: Download,
    translationKey: "downloads",
  },
  {
    href: "/dashboard/promo-codes",
    icon: Tag,
    translationKey: "promoCodes",
  },
  {
    href: "/dashboard/admin-management",
    icon: Users,
    translationKey: "adminManagement",
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    translationKey: "settings",
  },
];

const DashboardSidebar = memo(() => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("dashboard.sidebar");
  const isArabic = locale === "ar";
  const { isDashboardMenuOpen, setIsDashboardMenuOpen } = useDashboardMenu();

  // Close mobile menu on route change
  useEffect(() => {
    setIsDashboardMenuOpen(false);
  }, [pathname, setIsDashboardMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDashboardMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setIsDashboardMenuOpen]);

  // Close menu on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsDashboardMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsDashboardMenuOpen]);

  const isActiveLink = (href: string, exact: boolean = false) => {
    const localizedHref = `/${locale}${href}`;
    if (exact) {
      return pathname === localizedHref || pathname === `${localizedHref}/`;
    }
    return pathname.startsWith(localizedHref);
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/assets/images/originalLogo-no-bg.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
              {t("title") || "Dashboard"}
            </h1>
            <p className="text-xs text-gray-500">{t("subtitle") || "Admin Panel"}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const localizedHref = `/${locale}${item.href}`;
          const isActive = isActiveLink(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={localizedHref}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-primary-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className={`absolute ${isArabic ? "right-0" : "left-0"} top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-full`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <IconComponent
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? "text-primary-400" : "text-gray-500 group-hover:text-primary-400"
                }`}
              />

              <span className="font-medium text-sm flex-1">
                {t(`links.${item.translationKey}`) || item.translationKey}
              </span>

              {isActive && (
                <ChevronRight
                  className={`w-4 h-4 text-primary-400 ${isArabic ? "rotate-180" : ""}`}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-transparent">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {t("adminAccess") || "Admin Access"}
            </p>
            <p className="text-xs text-gray-500">{t("securePanel") || "Secure Panel"}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isDashboardMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setIsDashboardMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isDashboardMenuOpen && (
          <motion.aside
            initial={{ x: isArabic ? 288 : -288 }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? 288 : -288 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`lg:hidden fixed top-0 ${isArabic ? "right-0 border-l" : "left-0 border-r"} h-screen w-72 bg-black/95 backdrop-blur-xl border-white/10 z-50 flex flex-col`}
          >
            {/* Close button */}
            <button
              onClick={() => setIsDashboardMenuOpen(false)}
              className={`absolute top-4 ${isArabic ? "left-4" : "right-4"} p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>

            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed top-0 ${isArabic ? "right-0 border-l" : "left-0 border-r"} h-screen w-72 bg-black/80 backdrop-blur-xl border-white/10 flex-col z-30`}
      >
        <SidebarContent />
      </aside>
    </>
  );
});

DashboardSidebar.displayName = "DashboardSidebar";

export default DashboardSidebar;
