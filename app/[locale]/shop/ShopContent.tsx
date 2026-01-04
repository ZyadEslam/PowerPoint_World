"use client";

import React from "react";
import { Breadcrumb } from "@/app/components/seo/SEOComponents";
import { Suspense } from "react";
import { ProductSkeletonGroup } from "../../components/productComponents/LoadingSkeleton";
import ShopLayout from "../../components/shopComponents/ShopLayout";
import ProductImagePreloader from "../../components/shopComponents/ProductImagePreloader";
import type { ShopCategory } from "./shop-data";

interface ShopContentProps {
  category?: string;
  q?: string;
  breadcrumbItems: Array<{ name: string; url: string; current?: boolean }>;
  initialCategories?: ShopCategory[];
  criticalImageUrls?: string[];
}

const ShopContent: React.FC<ShopContentProps> = ({
  category,
  breadcrumbItems,
  initialCategories,
  criticalImageUrls = [],
}) => {
  return (
    <div className="md:px-[8.5%] sm:px-[5%]">
      {/* Preload critical above-fold images */}
      {criticalImageUrls.length > 0 && (
        <ProductImagePreloader imageUrls={criticalImageUrls} />
      )}
      <Breadcrumb items={breadcrumbItems} />

      <Suspense fallback={<ProductSkeletonGroup />}>
        <ShopLayout
          initialCategory={category}
          initialCategories={initialCategories}
        />
      </Suspense>
    </div>
  );
};

export default ShopContent;
