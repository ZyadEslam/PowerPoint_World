import React from "react";
import Image from "next/image";
const ImageSection = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-full max-w-md">
        <Image
          src="/assets/my_location_image.svg"
          alt="Shipping Address"
          width={300}
          height={300}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};
export default ImageSection;
