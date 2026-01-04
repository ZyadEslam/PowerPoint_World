"use client";
import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/public/assets/assets";
import { AuthButtons, ToggleMenuBtn } from "./";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Package, LogOut } from "lucide-react";
import { useCart } from "@/app/hooks/useCart";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { signOut } from "next-auth/react";
import { useDashboardMenu } from "@/app/context/dashboardMenuCtx";

const UserNav = memo(() => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const tOrders = useTranslations("orders");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const originalOverflowRef = useRef<string | null>(null);
  const { data: session } = useSession();
  const { getCartItemCount, manualSync: syncCart } = useCart();
  const cartItemCount = getCartItemCount();

  // Ensure component is mounted before using portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignout = async () => {
    try {
      await syncCart();
      await signOut({ callbackUrl: "/" });
    } catch {
      // Error handled silently for production
    }
  };

  // Helper to add locale to paths
  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isMenuOpen) {
      // Store original overflow only once when menu opens
      if (originalOverflowRef.current === null) {
        originalOverflowRef.current = document.body.style.overflow || "";
      }
      document.body.style.overflow = "hidden";
    } else if (originalOverflowRef.current !== null) {
      // Restore original overflow when menu closes
      document.body.style.overflow = originalOverflowRef.current;
      originalOverflowRef.current = null;
    }

    // On unmount, always restore overflow if we changed it
    return () => {
      if (originalOverflowRef.current !== null) {
        document.body.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = null;
      }
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    // Throttle resize with requestAnimationFrame
    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        window.requestAnimationFrame(handleResize);
      }, 150);
    };

    window.addEventListener("resize", throttledResize, { passive: true });

    return () => {
      window.removeEventListener("resize", throttledResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest(".mobile-menu")) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMenuOpen, closeMenu]);

  const isDashboard = pathname.includes("/dashboard");
  const { isDashboardMenuOpen, toggleDashboardMenu } = useDashboardMenu();
  const isArabic = locale.startsWith("ar");

  return (
    <nav
      className={`w-[100%] sticky top-0 ${
        isDashboard
          ? "z-40 bg-background backdrop-blur-md shadow-sm border-b border-black/20"
          : "z-[100] user-nav bg-background"
      }`}
    >
      <div
        className={`w-[95%] mx-auto sm:container sm:mx-auto sm:px-6 lg:px-8`}
      >
        <div className="flex items-center justify-between h-16 lg:h-20">
          {!isDashboard ? (
            <>
              {/* Left Side - Menu Toggle Button */}
              <div
                className={`flex items-center flex-1 ${
                  isMenuOpen ? "hidden" : ""
                }`}
              >
                <ToggleMenuBtn
                  isMenuOpen={isMenuOpen}
                  toggleMenu={toggleMenu}
                />
              </div>

              {/* Center - Logo */}
              <div className="flex-1 flex justify-center">
                <Link
                  href={getLocalizedPath("/")}
                  className="flex flex-row items-center space-x-2 sm:space-x-3 group"
                  dir="ltr"
                >
                  <div className="relative">
                    <Image
                      src={assets.espesialLogo}
                      alt="Espesyal Shop Logo"
                      width={120}
                      height={45}
                      className="object-contain h-10 sm:h-12 lg:h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                      priority
                      quality={85}
                      sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px"
                    />
                  </div>
                  <span className="brand-name text-xl sm:text-2xl lg:text-3xl transition-all duration-300 group-hover:scale-105">
                    Espesyal
                  </span>
                </Link>
              </div>

              {/* Right Side - Icons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
                {/* Cart Icon */}
                <Link
                  href={getLocalizedPath("/cart")}
                  className="relative p-2 text-gray-700 hover:text-primary transition-all duration-300 rounded-lg hover:bg-primary/5"
                  title={t("shoppingCart")}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white rounded-full text-[10px] font-semibold flex items-center justify-center px-1 shadow-md">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </Link>

                {/* My Orders Icon - Hidden on mobile */}
                {session && session.user && session.user.id && (
                  <Link
                    href={getLocalizedPath("/my-orders")}
                    className="hidden md:block p-2 text-gray-700 hover:text-primary transition-all duration-300 rounded-lg hover:bg-primary/5"
                    title={tOrders("myOrders")}
                  >
                    <Package className="w-5 h-5" />
                  </Link>
                )}

                {/* User Icon with Signout - Hidden on mobile */}
                {session?.user && (
                  <div className="hidden md:flex items-center gap-2">
                    <div className="flex items-center justify-center text-gray-700 hover:text-primary transition-all duration-300 rounded-lg hover:bg-primary/5 p-2">
                      <User className="w-5 h-5 font-semibold" />
                    </div>
                    <button
                      onClick={handleSignout}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-primary transition-all duration-300 rounded-lg hover:bg-primary/5"
                      title={t("signOut")}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden lg:inline">{t("signOut")}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Menu Panel - Rendered via Portal to body */}
              {isMounted &&
                createPortal(
                  <div
                    className={`mobile-menu fixed inset-0 z-[99999] transition-all duration-300 ${
                      isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                  >
                    {/* Backdrop - Fixed to cover entire viewport */}
                    <div
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                      onClick={closeMenu}
                    />

                    {/* Menu Panel - Slides from Left/Right based on locale */}
                    <div
                      className={`fixed top-0 h-full w-80 max-w-[85vw] lg:max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
                        isArabic
                          ? `right-0 ${
                              isMenuOpen ? "translate-x-0" : "translate-x-full"
                            }`
                          : `left-0 ${
                              isMenuOpen ? "translate-x-0" : "-translate-x-full"
                            }`
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                          <span className="text-lg font-semibold text-gray-900">
                            {t("menu")}
                          </span>
                          <button
                            onClick={closeMenu}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={t("closeMenu")}
                          >
                            <svg
                              className="w-5 h-5 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 px-6 py-8 space-y-4 overflow-y-auto">
                          <Link
                            href={getLocalizedPath("/")}
                            className="block text-lg font-medium text-gray-700 hover:text-primary transition-colors duration-300 py-2"
                            onClick={closeMenu}
                          >
                            {t("home")}
                          </Link>
                          <Link
                            href={getLocalizedPath("/shop")}
                            className="block text-lg font-medium text-gray-700 hover:text-primary transition-colors duration-300 py-2"
                            onClick={closeMenu}
                          >
                            {t("shop")}
                          </Link>
                          <Link
                            href={getLocalizedPath("/about")}
                            className="block text-lg font-medium text-gray-700 hover:text-primary transition-colors duration-300 py-2"
                            onClick={closeMenu}
                          >
                            {t("about")}
                          </Link>

                          {/* My Orders Link - Only show when user is logged in */}
                          {session && session.user && session.user.id && (
                            <Link
                              href={getLocalizedPath("/my-orders")}
                              className="flex items-center gap-3 text-lg font-medium text-gray-700 hover:text-primary transition-colors duration-300 py-2"
                              onClick={closeMenu}
                            >
                              <Package className="w-5 h-5" />
                              <span>{tOrders("myOrders")}</span>
                            </Link>
                          )}

                          {/* Dashboard Link */}
                          {session?.user?.isAdmin && (
                            <Link
                              href={getLocalizedPath("/dashboard")}
                              className="block w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white text-center font-semibold rounded-lg hover:shadow-lg transition-all duration-300 mt-4"
                              onClick={closeMenu}
                            >
                              {t("dashboard")}
                            </Link>
                          )}

                          {/* Auth Buttons */}
                          <div className="pt-6 border-t border-gray-200 mt-6">
                            <AuthButtons screen="mobile" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle Button - Only visible on small screens */}
              <div className="lg:hidden flex items-center">
                <ToggleMenuBtn
                  isMenuOpen={isDashboardMenuOpen}
                  toggleMenu={toggleDashboardMenu}
                />
              </div>

              {/* Dashboard Badge */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange/10 to-orange/5 border border-orange/20 rounded-xl">
                <div className="w-2 h-2 bg-orange rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  {t("adminMode")}
                </span>
              </div>

              {/* User Info */}
              {session?.user && (
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange to-orange/80 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900 leading-tight">
                      {session.user.name || session.user.email?.split("@")[0]}
                    </span>
                    <span className="text-xs text-gray-500">Admin</span>
                  </div>
                </div>
              )}

              {/* Exit Button */}
              <Link
                href={getLocalizedPath("/")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">{t("exitDashboard")}</span>
                <span className="sm:hidden">{t("exit")}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});

UserNav.displayName = "UserNav";

export default UserNav;
