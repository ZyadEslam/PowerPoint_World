import React, { Suspense } from "react";
import CategoriesLoadingSection from "../components/homeComponents/CategoriesLoadingSection";
import LoadingSpinner from "../UI/LoadingSpinner";
import HeroSection from "../components/homeComponents/HeroSection";
import CategorySection from "../components/homeComponents/CategorySection";
import SubscriptionOffer from "../components/homeComponents/SubscriptionOffer";
import {
  getActiveCategories,
  getProductsForCategories,
} from "../utils/serverApi";

// Add ISR revalidation
export const revalidate = 60; // Revalidate every 60 seconds

// Separate component for categories to enable streaming
async function CategoriesContent() {
  // Fetch categories server-side
  const categories = await getActiveCategories();

  // Fetch products for all categories in parallel
  const productsMap = await getProductsForCategories(categories, 20);

  if (categories.length === 0) {
    return <CategoriesLoadingSection />;
  }

  return (
    <>
      {categories.map((category) => {
        const products = productsMap.get(category._id) || [];
        return (
          <Suspense
            key={category._id}
            fallback={
              <section className="section-spacing">
                <div className="layout-shell">
                  <div className="mb-8 text-left">
                    <h2 className="text-2xl uppercase lg:text-3xl font-bold text-foreground mb-4">
                      {category.name}
                    </h2>
                  </div>
                  <div className="flex gap-6 overflow-hidden pb-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-64 h-80 bg-gray-200 animate-pulse rounded-2xl"
                      />
                    ))}
                  </div>
                </div>
              </section>
            }
          >
            <CategorySection
              categoryName={category.name}
              categorySlug={category.slug}
              products={products}
              isFirstCategory={categories.indexOf(category) === 0}
            />
          </Suspense>
        );
      })}
    </>
  );
}

export default async function Home() {
  return (
    <main className="min-h-screen">
      {/* Black Friday Campaign Hero Section - Render immediately */}
      <section className="w-full h-[90vh]">
        <div className="w-full h-full">
          <HeroSection />
        </div>
      </section>

      {/* Category-based Product Sections - Stream separately */}
      <Suspense fallback={<CategoriesLoadingSection />}>
        <CategoriesContent />
      </Suspense>

      {/* Subscription Offer */}
      <section className="w-full ">
        <div className="">
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionOffer />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
