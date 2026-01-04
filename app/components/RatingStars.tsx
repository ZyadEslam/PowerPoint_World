import { assets } from "@/public/assets/assets";
import React from "react";
import Image from "next/image";
const RatingStars = ({ rating }: { rating: number }) => {
  return (
      <span className="flex items-center gap-1">
        {Array.from({ length: rating }).map((_, index) => (
          <Image
            key={"product star" + index}
            src={assets.star_icon}
            width={12}
            height={12}
            alt="star_icon"
            style={{ width: 12, height: 'auto' }}
          />
        ))}
        {Array.from({ length: Math.ceil(5 - rating) }).map((_, index) => (
          <Image
            key={"product star dull" + index}
            src={assets.star_dull_icon}
            width={12}
            height={12}
            alt="star_icon"
            style={{ width: 12, height: 'auto' }}
          />
        ))}
      </span>
  );
};

export default RatingStars;
