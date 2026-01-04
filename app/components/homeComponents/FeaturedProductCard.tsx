"use client";
import React from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FeaturedProductProps {
  title: string;
  description: string;
  imageSrc: StaticImageData;
  alt?: string;
}

const FeaturedProductCard = ({
  title,
  description,
  imageSrc,
  alt = "Featured product",
}: FeaturedProductProps) => {
  const router = useRouter();

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/shop");
  };

  return (
    <div className="group relative md:w-[28%] sm:w-[100%] h-[400px] overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 hover:border-orange/20">
      <Link href="/shop" className="block h-full">
        {/* Image Container */}
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 28vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-orange rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100"></div>
          <div className="absolute top-8 right-4 w-1 h-1 bg-orange/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200"></div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
            {/* Title */}
            <h3 className="text-white text-2xl font-semibold mb-2 leading-tight group-hover:text-orange transition-colors duration-300">
              {title}
            </h3>

            {/* Description */}
            <p className="text-white/90 text-sm mb-4 w-[85%] line-clamp-2 leading-relaxed group-hover:text-white transition-colors duration-300">
              {description}
            </p>

            {/* Button */}
            <button
              onClick={handleExploreClick}
              className="bg-orange text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange/90 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-orange/20"
              suppressHydrationWarning
            >
              Explore more
            </button>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange/30 transition-all duration-300 pointer-events-none"></div>
      </Link>
    </div>
  );
};

export default FeaturedProductCard;
