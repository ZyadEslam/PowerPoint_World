"use client";
import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Sparkles,
  User,
  Package,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image"; // Still needed for logo
import { useSession, signOut } from "next-auth/react";

const PowerPointNavbar = () => {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Use passive scroll listener for better performance
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: t("home"), isAnchor: false },
    {
      href: "/templates",
      label: t("templates") || "Templates",
      isAnchor: false,
    },
    { href: "#work", label: t("work") || "My Work", isAnchor: true },
    { href: "#about", label: t("about"), isAnchor: true },
  ];

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  const handleMouseLeave = useCallback(() => {
    setPosition((pv) => ({ ...pv, opacity: 0 }));
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}` });
  };

  // Hide navbar on dashboard pages (dashboard has its own navigation)
  const isDashboardPage = pathname?.includes("/dashboard");

  if (isDashboardPage) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="relative mx-auto flex items-center justify-center px-4">
          <ul
            onMouseLeave={handleMouseLeave}
            className="relative flex items-center w-[95%] md:w-[90%] max-w-5xl rounded-full border border-primary-500/20 bg-black/80 backdrop-blur-2xl p-1.5 shadow-2xl shadow-primary-500/5"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {/* Static gradient glow effect */}
            <div
              className="absolute -inset-px rounded-full opacity-30 -z-10"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255, 165, 0, 0.15), transparent, rgba(255, 165, 0, 0.1))",
              }}
            />

            {/* User Section - Left side */}
            <li className="relative z-10 hidden md:flex items-center px-4 py-2 user-menu-container">
              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              ) : session?.user ? (
                // Logged in - User Menu
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-500" />
                    </div>
                    <span className="hidden lg:block max-w-[100px] truncate">
                      {session.user.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-white/10">
                          <p className="text-white font-medium truncate">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            href={getLocalizedPath("/my-templates")}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Package className="w-4 h-4 text-primary-500" />
                            <span>{t("myTemplates") || "My Templates"}</span>
                          </Link>

                          {session.user.isAdmin && (
                            <Link
                              href={getLocalizedPath("/dashboard")}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-primary-500" />
                              <span>{t("dashboard") || "Dashboard"}</span>
                            </Link>
                          )}
                        </div>

                        {/* Sign Out */}
                        <div className="p-2 border-t border-white/10">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t("signOut") || "Sign Out"}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Not logged in - Login Link
                <Link
                  href={getLocalizedPath("/auth/signin")}
                  className="relative group flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">
                    {t("login")}
                    <span className="absolute -bottom-1 left-0 h-px bg-primary-500 w-0 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              )}
            </li>

            {/* Separator */}
            <li className="hidden md:block h-6 w-px bg-gray-700 mx-2" />

            {/* Navigation Links - Center (Desktop) */}
            <div className="hidden md:flex items-center flex-1 justify-center">
              {navLinks.map((link) => (
                <Tab key={link.href} setPosition={setPosition}>
                  {link.isAnchor ? (
                    <a
                      href={link.href}
                      className="block w-full h-full whitespace-nowrap"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={getLocalizedPath(link.href)}
                      className="block w-full h-full whitespace-nowrap"
                    >
                      {link.label}
                    </Link>
                  )}
                </Tab>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <li className="md:hidden relative z-10 px-4 py-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </li>

            {/* Spacer for mobile */}
            <li className="flex-1 md:hidden" />

            {/* Separator */}
            <li className="hidden md:block h-6 w-px bg-gray-700 mx-2" />

            {/* Translation Buttons and Logo - Right side */}
            <li className="relative z-10 flex items-center gap-3 px-3 py-1.5 md:px-4 md:py-2">
              <LanguageSwitcher />
              <Link
                href={getLocalizedPath("/")}
                className="flex items-center gap-2 group"
              >
                <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:scale-105 transition-transform">
                  <Image
                    src="/assets/images/originalLogo-no-bg.png"
                    alt="PowerPoint Templates"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="hidden lg:block text-sm font-bold text-white group-hover:text-primary-400 transition-colors">
                  {t("logo") || "PowerPoint"}
                </span>
              </Link>
            </li>

            {/* Hover cursor */}
            <Cursor position={position} />
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              className="absolute inset-x-4 top-24 p-6 rounded-2xl border border-primary-500/20 bg-black/90 backdrop-blur-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* User Info (Mobile) */}
              {session?.user && (
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-800">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {navLinks.map((link, index) => (
                  <div key={link.href}>
                    {link.isAnchor ? (
                      <a
                        href={link.href}
                        className="block px-4 py-3 text-lg font-medium text-white/80 hover:text-white hover:bg-primary-500/10 rounded-lg transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary-500" />
                          {link.label}
                        </span>
                      </a>
                    ) : (
                      <Link
                        href={getLocalizedPath(link.href)}
                        className="block px-4 py-3 text-lg font-medium text-white/80 hover:text-white hover:bg-primary-500/10 rounded-lg transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary-500" />
                          {link.label}
                        </span>
                      </Link>
                    )}
                  </div>
                ))}

                {/* My Templates (Mobile) */}
                {session?.user && (
                  <Link
                    href={getLocalizedPath("/my-templates")}
                    className="block px-4 py-3 text-lg font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <Package className="w-5 h-5" />
                      {t("myTemplates") || "My Templates"}
                    </span>
                  </Link>
                )}

                {/* Admin Dashboard (Mobile) */}
                {session?.user?.isAdmin && (
                  <Link
                    href={getLocalizedPath("/dashboard")}
                    className="block px-4 py-3 text-lg font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      {t("dashboard") || "Dashboard"}
                    </span>
                  </Link>
                )}

                {/* Login/Logout button in mobile menu */}
                <div className="pt-4 border-t border-gray-800">
                  {session?.user ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full px-4 py-3 text-lg font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                      <span className="flex items-center gap-3">
                        <LogOut className="w-5 h-5" />
                        {t("signOut") || "Sign Out"}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={getLocalizedPath("/auth/signin")}
                      className="block px-4 py-3 text-lg font-medium text-primary-400 hover:text-primary-300 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        {t("login")}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Tab = ({
  children,
  setPosition,
}: {
  children: React.ReactNode;
  setPosition: (position: {
    left: number;
    width: number;
    opacity: number;
  }) => void;
}) => {
  const ref = useRef<HTMLLIElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (!ref?.current) return;
    const { width } = ref.current.getBoundingClientRect();
    setPosition({
      left: ref.current.offsetLeft,
      width,
      opacity: 1,
    });
  }, [setPosition]);

  return (
    <li
      ref={ref}
      onMouseEnter={handleMouseEnter}
      className="relative z-10 cursor-pointer px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
    >
      {children}
    </li>
  );
};

const Cursor = ({
  position,
}: {
  position: { left: number; width: number; opacity: number };
}) => {
  return (
    <motion.li
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className="absolute z-0 h-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-500"
      style={{
        boxShadow: "0 0 15px rgba(255, 165, 0, 0.4)",
      }}
    />
  );
};

export default PowerPointNavbar;
