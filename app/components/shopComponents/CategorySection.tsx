"use client";
import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryProps } from "../../types/types";

interface CategorySectionProps {
  categories: CategoryProps[];
  title?: string;
  className?: string;
}

const CategorySection = memo(
  ({
    categories,
    title = "Shop by Category",
    className = "",
  }: CategorySectionProps) => {
    return (
      <section className={`py-8 ${className}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600">Discover our curated collections</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/shop?category=${category.slug}`}
              className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="aspect-square relative bg-gray-100">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                    <span className="text-4xl font-bold text-orange-600">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 group-hover:text-orange transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-orange font-medium mt-2">
                  {category.products?.length || 0} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }
);

CategorySection.displayName = "CategorySection";

export default CategorySection;
