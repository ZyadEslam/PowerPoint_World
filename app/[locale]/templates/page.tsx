"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
  Star,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";
import FuturisticBackground from "@/app/components/ui/FuturisticBackground";

interface Template {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number;
  thumbnail: string;
  categoryName: string;
  rating: number;
  reviewCount: number;
  purchaseCount: number;
  viewCount: number;
  isFeatured: boolean;
  slides?: number;
  tags: string[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function TemplatesContent() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("templates");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);
      params.set("sort", sortBy);
      params.set("page", currentPage.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();

      setTemplates(data.templates || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, currentPage]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (searchQuery) params.set("search", searchQuery);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = params.toString()
      ? `/${locale}/templates?${params.toString()}`
      : `/${locale}/templates`;
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, searchQuery, sortBy, currentPage, locale, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTemplates();
  };

  const sortOptions = [
    { value: "newest", label: t("sort.newest") || "Newest" },
    { value: "oldest", label: t("sort.oldest") || "Oldest" },
    { value: "price-low", label: t("sort.priceLow") || "Price: Low to High" },
    { value: "price-high", label: t("sort.priceHigh") || "Price: High to Low" },
    { value: "popular", label: t("sort.popular") || "Most Popular" },
    { value: "rating", label: t("sort.rating") || "Highest Rated" },
  ];

  return (
    <main className="relative min-h-screen pt-24 pb-16">
      <FuturisticBackground showGrid showOrbs={false} showHexPattern={false} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-400">
              {t("badge") || "Premium Templates"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("title") || "PowerPoint Templates"}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t("subtitle") ||
              "Discover our collection of professionally designed templates"}
          </p>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder") || "Search templates..."}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 cursor-pointer"
              >
                <option value="all" className="bg-gray-900">
                  {t("allCategories") || "All Categories"}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug} className="bg-gray-900">
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-primary-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-primary-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {pagination && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400">
              {t("showing") || "Showing"}{" "}
              <span className="text-white font-medium">
                {templates.length}
              </span>{" "}
              {t("of") || "of"}{" "}
              <span className="text-white font-medium">{pagination.total}</span>{" "}
              {t("templates") || "templates"}
            </p>
          </div>
        )}

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/10] bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-6 bg-white/10 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("noResults") || "No templates found"}
            </h3>
            <p className="text-gray-400">
              {t("tryDifferent") || "Try adjusting your search or filters"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 lg:grid-cols-2"
            }`}
          >
            <AnimatePresence mode="popLayout">
              {templates.map((template, index) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  index={index}
                  viewMode={viewMode}
                  locale={locale}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-2 mt-12"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
              {t("prev") || "Previous"}
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-primary-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={!pagination.hasNext}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
              {t("next") || "Next"}
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}

// Template Card Component
function TemplateCard({
  template,
  index,
  viewMode,
  locale,
}: {
  template: Template;
  index: number;
  viewMode: "grid" | "list";
  locale: string;
}) {
  const discount = template.oldPrice
    ? Math.round(((template.oldPrice - template.price) / template.oldPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/${locale}/templates/${template.slug}`}>
        <div
          className={`group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10 ${
            viewMode === "list" ? "flex" : ""
          }`}
        >
          {/* Image */}
          <div
            className={`relative overflow-hidden ${
              viewMode === "list" ? "w-64 flex-shrink-0" : "aspect-[16/10]"
            }`}
          >
            <Image
              src={template.thumbnail}
              alt={template.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Featured Badge */}
            {template.isFeatured && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary-500/90 backdrop-blur-sm">
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
                <span className="text-xs font-bold text-white">-{discount}%</span>
              </div>
            )}

            {/* Quick Stats */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Eye className="w-3 h-3" />
                  {template.viewCount}
                </div>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Download className="w-3 h-3" />
                  {template.purchaseCount}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
            {/* Category */}
            <p className="text-xs font-medium text-primary-400 mb-2">
              {template.categoryName}
            </p>

            {/* Title */}
            <h3 className="font-semibold text-white text-lg mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">
              {template.name}
            </h3>

            {/* Description (list view only) */}
            {viewMode === "list" && template.shortDescription && (
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {template.shortDescription}
              </p>
            )}

            {/* Rating & Slides */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-white">{template.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">
                  ({template.reviewCount})
                </span>
              </div>
              {template.slides && (
                <span className="text-xs text-gray-500">
                  {template.slides} slides
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">
                {template.price === 0 ? "Free" : `${template.price} EGP`}
              </span>
              {template.oldPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {template.oldPrice} EGP
                </span>
              )}
            </div>
          </div>

          {/* Hover Border Glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border border-primary-500/50" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Export with Suspense boundary
export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}

