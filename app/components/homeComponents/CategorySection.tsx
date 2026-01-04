"use client";
import React, { useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductCardProps } from "../../types/types";
import ProductCard from "../productComponents/ProductCard";

interface CategorySectionProps {
  categoryName: string;
  categorySlug: string;
  products: ProductCardProps[];
  isFirstCategory?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryName,
  categorySlug,
  products,
  isFirstCategory = false,
}) => {
  const t = useTranslations("home");
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "prev" | "next") => {
    if (!scrollContainerRef.current) return;

    // Use requestAnimationFrame to batch DOM reads/writes and avoid forced reflows
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Batch DOM reads - get all needed values at once
      const card = container.querySelector(".category-card");
      const cardWidth = card instanceof HTMLElement ? card.offsetWidth : 0;
      // Gap is 16px (1rem) on mobile, 24px (1.5rem) on larger screens
      const gap = window.innerWidth >= 640 ? 24 : 16;
      const scrollAmount = cardWidth + gap;

      // Batch DOM write - perform scroll in the same frame
      requestAnimationFrame(() => {
        container.scrollBy({
          left: direction === "next" ? scrollAmount : -scrollAmount,
          behavior: "smooth",
        });
      });
    });
  };

  if (products.length === 0) {
    return null; // Don't render section if no products
  }

  return (
    <section className="section-spacing">
      <div className="layout-shell">
        {/* Section Header */}
        <div
          className={`mb-8 flex flex-row lg:flex-row justify-between lg:items-center ${
            isArabic ? "text-right sm:text-right" : "text-left sm:text-left"
          }`}
        >
          <h2 className="text-2xl uppercase lg:text-3xl font-bold text-gray-800 mb-4">
            {categoryName}
          </h2>
          {/* View All Button */}
          <div>
            <Link
              href={`/${locale}/shop?category=${categorySlug}`}
              className={`inline-flex items-center gap-2 text-sm font-semibold text-gray-800 transition-all duration-300 hover:text-primary ${
                isArabic ? "flex-row-reverse" : ""
              }`}
            >
              {t("viewAll") || "View All"}
              {isArabic ? (
                <ArrowLeftIcon className="w-6 h-6 bg-gray-200 rounded-full p-1" />
              ) : (
                <ArrowRightIcon className="w-6 h-6 bg-gray-200 rounded-full p-1" />
              )}
            </Link>
          </div>
        </div>

        {/* Scrollable Carousel */}
        <div className="relative">
          <button
            onClick={() => handleScroll("prev")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-sm"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="overflow-x-auto scrollbar-hide px-4 sm:px-6 md:px-10 lg:px-12 snap-x snap-mandatory"
            ref={scrollContainerRef}
          >
            <div className="flex gap-4 sm:gap-6 min-w-max">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="category-card w-[calc(100vw-2rem)] sm:w-60 md:w-64 lg:w-72 flex-shrink-0 snap-start"
                >
                  <ProductCard
                    product={product}
                    isLCP={isFirstCategory && index === 0} // First product in first category is LCP candidate
                    isAboveFold={isFirstCategory && index < 3} // First 3 products in first category are above the fold
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleScroll("next")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-sm"
            aria-label="Next products"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
