"use client";
import { StaticImageData } from "next/image";
import React from "react";
import { assets } from "@/public/assets/assets";
import FeaturedProductCard from "./FeaturedProductCard";
interface FeaturedProductsProps {
  id: string;
  title: string;
  description: string;
  imageSrc: StaticImageData;
}
const featuredProducts: FeaturedProductsProps[] = [
  {
    id: "Featured Product 1",
    title: "Unparalleled Sound",
    description: "Experience crystal-clear audio with premium headphones.",
    imageSrc: assets.girl1,
  },
  {
    id: "Featured Product 2",
    title: "Stay Connected",
    description: "Compact and stylish earphones for every occasion.",
    imageSrc: assets.girl3,
  },
  {
    id: "Featured Product 3",
    title: "Power in Every Pixel",
    description: "Shop the latest laptops for work, gaming, and more.",
    imageSrc: assets.girl8,
  },
];
const FeaturedProductsList = () => {
  return (
    <div className="flex sm:flex-col md:flex-row md:gap-10 gap-4 justify-center mb-8">
      {featuredProducts.map((item) => (
        <FeaturedProductCard
          key={item.id}
          title={item.title}
          description={item.description}
          imageSrc={item.imageSrc}
        />
      ))}
    </div>
  );
};

export default FeaturedProductsList;
