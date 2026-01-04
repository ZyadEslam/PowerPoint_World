import { assets } from "@/public/assets/assets";
import Image, { StaticImageData } from "next/image";
import React, { useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export interface ImageState {
  image1: StaticImageData | string;
  image2: StaticImageData | string;
  image3: StaticImageData | string;
  image4: StaticImageData | string;
}

interface ImageUploaderProps {
  images: ImageState;
  onImageChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    imageKey: string
  ) => void;
  onRemoveImage: (imageKey: string) => void;
  resetKey?: number; // Used to reset file inputs when form is cleared
}

const ImageUploaderComponent: React.FC<ImageUploaderProps> = React.memo(
  ({ images, onImageChange, onRemoveImage, resetKey }) => {
    const t = useTranslations("dashboard.addProduct");
    const fileInputRefs = {
      image1: useRef<HTMLInputElement>(null),
      image2: useRef<HTMLInputElement>(null),
      image3: useRef<HTMLInputElement>(null),
      image4: useRef<HTMLInputElement>(null),
    };

    // Clear file inputs when resetKey changes
    React.useEffect(() => {
      if (resetKey !== undefined) {
        Object.values(fileInputRefs).forEach((ref) => {
          if (ref.current) {
            ref.current.value = "";
          }
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    // Cleanup blob URLs on unmount to prevent memory leaks
    useEffect(() => {
      return () => {
        Object.values(images).forEach((image) => {
          if (typeof image === "string" && image.startsWith("blob:")) {
            URL.revokeObjectURL(image);
          }
        });
      };
    }, [images]);

    const handleImageClick = useCallback(
      (inputRef: React.RefObject<HTMLInputElement | null>) => {
        inputRef.current?.click();
      },
      []
    );

    // Helper function to check if image is a blob URL (string)
    const isBlobUrl = (image: StaticImageData | string): image is string => {
      return typeof image === "string";
    };

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {t("imagesLabel")}
        </label>
        <div className="flex sm:flex-col md:flex-row gap-3">
          {Object.keys(images).map((imageKey, index) => (
            <div className="md:w-1/4 relative" key={imageKey}>
              <div className="relative">
                {images[imageKey as keyof ImageState] !==
                  assets.upload_area && (
                  <span
                    className="absolute top-0 cursor-pointer text-gray-500 bg-gray-100 right-0 px-3 py-1 rounded-md z-10"
                    onClick={() => onRemoveImage(imageKey)}
                  >
                    X
                  </span>
                )}

                {isBlobUrl(images[imageKey as keyof ImageState]) ? (
                  // Use regular img tag for blob URLs (works in production)
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[imageKey as keyof ImageState] as string}
                    alt={`Product image ${index + 1}`}
                    width={100}
                    height={100}
                    className="upload-area cursor-pointer w-full h-full object-cover rounded"
                    onClick={() =>
                      handleImageClick(
                        fileInputRefs[imageKey as keyof typeof fileInputRefs]
                      )
                    }
                  />
                ) : (
                  // Use Next.js Image for StaticImageData (like upload_area)
                  <Image
                    src={images[imageKey as keyof ImageState] as StaticImageData}
                    alt={`Product image ${index + 1}`}
                    width={100}
                    height={100}
                    className="upload-area cursor-pointer"
                    onClick={() =>
                      handleImageClick(
                        fileInputRefs[imageKey as keyof typeof fileInputRefs]
                      )
                    }
                  />
                )}
              </div>
              <input
                type="file"
                className="hidden"
                id={`p-image${index + 1}`}
                name={`image${index + 1}`}
                ref={fileInputRefs[imageKey as keyof typeof fileInputRefs]}
                onChange={(e) => onImageChange(e, imageKey)}
                accept="image/*"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">{t("imagesHint")}</p>
      </div>
    );
  }
);

ImageUploaderComponent.displayName = "ImageUploader";

export default ImageUploaderComponent;
