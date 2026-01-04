import { MetadataRoute } from "next";
import { api } from "./utils/api";
import { ProductCardProps } from "./types/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://espesyal-shop.vercel.app";

  try {
    // Get all products
    const products = await api.getProducts();

    // Get all categories - we'll need to add this method or use a fallback
    const categories: Array<{
      slug: string;
      updatedAt?: string;
      createdAt?: string;
    }> = []; // For now, empty array until we add getAllCategories method

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
    ];

    // Product pages - filter out products without _id
    const productPages = products
      .filter((product): product is ProductCardProps & { _id: string } => !!product._id)
      .map((product) => ({
        url: `${baseUrl}/product/${product._id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    // Category pages
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/shop?category=${category.slug}`,
      lastModified: new Date(
        category.updatedAt || category.createdAt || new Date().toISOString()
      ),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback to static pages only
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
    ];
  }
}
