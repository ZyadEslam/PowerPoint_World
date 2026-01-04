"use client";
import { useEffect } from "react";

interface ProductImagePreloaderProps {
  imageUrls: string[];
}

/**
 * Component that preloads critical product images for above-fold content
 * This improves LCP by ensuring images start loading immediately
 */
export default function ProductImagePreloader({
  imageUrls,
}: ProductImagePreloaderProps) {
  useEffect(() => {
    if (typeof window === "undefined" || imageUrls.length === 0) {
      return;
    }

    // Preload each critical image
    imageUrls.forEach((url, index) => {
      // Check if link already exists to avoid duplicates
      const existingLink = document.head.querySelector(
        `link[href="${url}"][rel="preload"]`
      );
      if (existingLink) {
        return; // Already exists, skip
      }

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = url;
      link.as = "image";
      link.setAttribute("fetchpriority", index === 0 ? "high" : "auto");
      document.head.appendChild(link);
    });

    // Cleanup function to remove links when component unmounts
    return () => {
      imageUrls.forEach((url) => {
        const link = document.head.querySelector(
          `link[href="${url}"][rel="preload"]`
        );
        if (link && link.parentNode) {
          document.head.removeChild(link);
        }
      });
    };
  }, [imageUrls]);

  return null; // This component doesn't render anything
}
