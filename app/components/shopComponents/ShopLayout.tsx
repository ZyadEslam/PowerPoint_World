"use client";
import React, { memo, useState, useCallback, Suspense, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  useCategories,
  useProductsByCategory,
} from "../../hooks/useCategories";
import { useShopProducts } from "../../hooks/useShopProducts";
// import CategoryFilter from "./CategoryFilter";
import ProductFilters from "./ProductFilters";
import ProductsGrid from "./ProductsGrid";
// import CategorySection from "./CategorySection";
import Pagination from "./Pagination";
import { ProductSkeletonGroup } from "../productComponents/LoadingSkeleton";
import type { ShopCategory } from "@/app/[locale]/shop/shop-data";
import { CategoryProps } from "../../types/types";

interface ShopLayoutProps {
  initialCategory?: string;
  initialCategories?: ShopCategory[];
  className?: string;
}

const ShopLayout = memo(
  ({ initialCategory, initialCategories, className = "" }: ShopLayoutProps) => {
    const t = useTranslations("shop");
    const router = useRouter();
    const pathname = usePathname();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
      initialCategory || null
    );

    // Update selectedCategory when initialCategory changes
    React.useEffect(() => {
      if (initialCategory !== selectedCategory) {
        setSelectedCategory(initialCategory || null);
        setCurrentPage(1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCategory]); // Removed selectedCategory from deps to prevent unnecessary re-runs
    const [currentPage, setCurrentPage] = useState(1);

    // Only fetch categories client-side if not provided server-side
    // This eliminates unnecessary API call and reduces TBT significantly
    const shouldFetchCategories =
      !initialCategories || initialCategories.length === 0;
    const {
      categories: fetchedCategories,
      // featuredCategories,
      isLoading: categoriesLoadingFromHook,
    } = useCategories({ enabled: shouldFetchCategories });

    // Convert ShopCategory[] to CategoryProps[] if needed, or use fetched categories
    const categories: CategoryProps[] = useMemo(() => {
      if (initialCategories && initialCategories.length > 0) {
        // Convert ShopCategory to CategoryProps format
        return initialCategories.map((cat) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          isActive: true, // ShopCategory only contains active categories
          isFeatured: false,
          sortOrder: 0,
          products: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }
      return fetchedCategories;
    }, [initialCategories, fetchedCategories]);

    const categoriesLoading = initialCategories
      ? false
      : categoriesLoadingFromHook;

    // Get prefetched data from context
    const {
      initialProducts,
      initialPagination,
      setCurrentProducts,
      setCurrentPagination,
      setCurrentFilters,
    } = useShopProducts();

    // Check if we need to fetch (if category or page changed from initial state)
    const needsFetch =
      currentPage !== 1 || selectedCategory !== initialCategory;

    // Use conditional fetching hook
    const {
      products: fetchedProducts,
      isLoading: isFetching,
      error: fetchError,
      pagination: fetchedPagination,
      filters: fetchedFilters,
    } = useProductsByCategory({
      categorySlug: selectedCategory || undefined,
      page: currentPage,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
      enabled: needsFetch,
    });

    // Update context state when we fetch new data
    React.useEffect(() => {
      if (needsFetch && !isFetching && fetchedProducts.length > 0) {
        setCurrentProducts(fetchedProducts);
        setCurrentPagination(fetchedPagination);
        setCurrentFilters(fetchedFilters);
      }
      // Only run when fetch completes, not on every dependency change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsFetch, isFetching]); // Optimized dependencies to reduce re-renders

    const products = needsFetch ? fetchedProducts : initialProducts;
    const pagination = needsFetch ? fetchedPagination : initialPagination;
    const productsLoading = needsFetch ? isFetching : false;
    const error = needsFetch ? fetchError : null;

    const handleCategoryChange = useCallback(
      (categorySlug: string | null) => {
        setSelectedCategory(categorySlug);
        setCurrentPage(1);

        // Update URL with category parameter
        const params = new URLSearchParams();
        if (categorySlug) {
          params.set("category", categorySlug);
        }
        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(newUrl, { scroll: false });
      },
      [pathname, router]
    );

    const handlePageChange = useCallback((page: number) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Get category name for display (don't block on loading)
    const categoryName = selectedCategory
      ? categories.find((c) => c.slug === selectedCategory)?.name ||
        (categoriesLoading ? "" : t("title"))
      : t("allProducts");

    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-6 bg-white rounded-lg p-6 shadow-sm">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                isLoading={categoriesLoading}
              />
            </div>
          </aside>

          {/* Products Section */}
          <main className="col-span-12 lg:col-span-9 mb-12 lg:mb-16">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {categoryName || (
                    <span className="inline-block w-32 h-8 bg-gray-200 animate-pulse rounded" />
                  )}
                </h1>
                <p className="text-gray-500 mt-1.5">
                  {pagination.totalProducts} {t("productCount")}
                </p>
              </div>
            </div>

            {/* Products Grid */}
            <Suspense fallback={<ProductSkeletonGroup />}>
              {products.length === 0 && !productsLoading ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">
                    {t("noProducts")}
                  </div>
                  <p className="text-gray-500">{t("tryAdjusting")}</p>
                </div>
              ) : (
                <ProductsGrid
                  products={products}
                  isLoading={productsLoading}
                  error={error}
                  gridCols="4"
                />
              )}
            </Suspense>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 mb-6 flex justify-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }
);

ShopLayout.displayName = "ShopLayout";

export default ShopLayout;
