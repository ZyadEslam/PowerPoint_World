/**
 * Server-side API functions that directly query the database
 * Use these in Server Components instead of making HTTP requests
 */

import Product from "@/app/models/product";
import Category from "@/app/models/category";
import connectDB from "@/app/utils/db";
import { ProductCardProps } from "../types/types";

/**
 * Get a single product by ID (server-side only)
 * OPTIMIZED: Uses aggregation to get image count without loading full buffer data
 */
export async function getProductById(
  id: string
): Promise<ProductCardProps | null> {
  try {
    await connectDB();
    const mongoose = await import("mongoose");

    if (!id) {
      throw new Error("Product ID is required");
    }

    // Use aggregation to get image count without loading the actual image buffers
    // This is a MAJOR optimization - avoids loading MB of image data into memory
    const result = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          oldPrice: 1,
          discount: 1,
          rating: 1,
          brand: 1,
          categoryName: 1,
          variants: 1,
          createdAt: 1,
          updatedAt: 1,
          // Get image count without loading actual buffer data
          imageCount: { $size: { $ifNull: ["$imgSrc", []] } },
        },
      },
    ]);

    const product = result[0];

    if (!product) {
      return null;
    }

    // Convert to ProductCardProps format
    const productObj: ProductCardProps = {
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      discount: product.discount?.toString(),
      rating: product.rating,
      brand: product.brand,
      categoryName: product.categoryName,
      variants: Array.isArray(product.variants)
        ? (product.variants as Array<{ _id?: { toString: () => string } | string; [key: string]: unknown }>).map((variant) => ({
            ...variant,
            _id: variant._id
              ? typeof variant._id === "string"
                ? variant._id
                : variant._id.toString()
              : undefined,
          })) as ProductCardProps["variants"]
        : (product.variants as ProductCardProps["variants"]),
      totalStock: product.variants?.reduce(
        (sum: number, v: { quantity?: number }) => sum + (v?.quantity || 0),
        0
      ) || 0,
      // Generate API endpoints based on image count (not actual buffer data)
      imgSrc: Array.from(
        { length: product.imageCount || 0 },
        (_, i) => `/api/product/image/${id}?index=${i}`
      ) as unknown as ProductCardProps["imgSrc"],
    };

    return productObj;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all products (server-side only)
 * OPTIMIZED: Uses aggregation to get image count without loading full buffer data
 */
export async function getAllProducts(): Promise<ProductCardProps[]> {
  try {
    await connectDB();

    // Use aggregation to get image count without loading the actual image buffers
    // This is a MAJOR optimization - avoids loading MB of image data into memory
    const products = await Product.aggregate([
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          oldPrice: 1,
          discount: 1,
          rating: 1,
          brand: 1,
          category: 1,
          categoryName: 1,
          hideFromHome: 1,
          variants: 1,
          createdAt: 1,
          updatedAt: 1,
          // Get image count without loading actual buffer data
          imageCount: { $size: { $ifNull: ["$imgSrc", []] } },
        },
      },
    ]);

    // Convert to ProductCardProps format
    const formattedProducts: ProductCardProps[] = products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      discount: product.discount?.toString(),
      rating: product.rating,
      brand: product.brand,
      category: product.category?.toString(),
      categoryName: product.categoryName,
      variants: Array.isArray(product.variants)
        ? (product.variants as Array<{ _id?: { toString: () => string } | string; [key: string]: unknown }>).map((variant) => ({
            ...variant,
            _id: variant._id
              ? typeof variant._id === "string"
                ? variant._id
                : variant._id.toString()
              : undefined,
          })) as ProductCardProps["variants"]
        : (product.variants as ProductCardProps["variants"]),
      totalStock: product.variants?.reduce(
        (sum: number, v: { quantity?: number }) => sum + (v?.quantity || 0),
        0
      ) || 0,
      // Generate API endpoints based on image count (not actual buffer data)
      imgSrc: Array.from(
        { length: product.imageCount || 0 },
        (_, i) => `/api/product/image/${product._id}?index=${i}`
      ) as unknown as ProductCardProps["imgSrc"],
    }));

    return formattedProducts;
  } catch {
    return [];
  }
}

interface CategoryDoc {
  _id: { toString: () => string };
  name: string;
  slug: string;
  sortOrder?: number;
  createdAt?: Date | string;
  [key: string]: unknown;
}

export interface ServerCategory {
  _id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
}

/**
 * Get active categories sorted by sortOrder (server-side only)
 */
export async function getActiveCategories(): Promise<ServerCategory[]> {
  try {
    await connectDB();

    const categories = (await Category.find({ isActive: true })
      .select("name slug sortOrder createdAt")
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
      .exec()) as unknown as CategoryDoc[];

    return categories.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      sortOrder: cat.sortOrder ?? 0,
      createdAt: cat.createdAt
        ? new Date(cat.createdAt).toISOString()
        : new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Get products by category ID (server-side only)
 * OPTIMIZED: Uses aggregation to get image count without loading full buffer data
 * @param categoryId - Category ID or slug
 * @param limit - Maximum number of products to return
 */
export async function getProductsByCategory(
  categoryId: string,
  limit: number = 20
): Promise<ProductCardProps[]> {
  try {
    await connectDB();
    const mongoose = await import("mongoose");

    // Check if categoryId is an ObjectId or slug
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(categoryId);
    let category: CategoryDoc | null = null;

    if (isValidObjectId) {
      category = (await Category.findById(
        categoryId
      ).lean()) as unknown as CategoryDoc | null;
    } else {
      category = (await Category.findOne({
        slug: categoryId,
        isActive: true,
      }).lean()) as unknown as CategoryDoc | null;
    }

    if (!category) {
      return [];
    }

    // Use aggregation to get image count without loading the actual image buffers
    // This is a MAJOR optimization - avoids loading MB of image data into memory
    const products = await Product.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(category._id.toString()),
          hideFromHome: { $ne: true },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          oldPrice: 1,
          discount: 1,
          rating: 1,
          brand: 1,
          categoryName: 1,
          createdAt: 1,
          // Get image count without loading actual buffer data
          imageCount: { $size: { $ifNull: ["$imgSrc", []] } },
        },
      },
    ]);

    return products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      discount: product.discount?.toString(),
      rating: product.rating,
      brand: product.brand,
      categoryName: product.categoryName,
      // Generate API endpoints based on image count (not actual buffer data)
      imgSrc: Array.from(
        { length: product.imageCount || 0 },
        (_, i) => `/api/product/image/${product._id}?index=${i}`
      ) as unknown as ProductCardProps["imgSrc"],
    }));
  } catch {
    return [];
  }
}

/**
 * Batch fetch products for multiple categories in parallel (server-side only)
 */
export async function getProductsForCategories(
  categories: ServerCategory[],
  limit: number = 20
): Promise<Map<string, ProductCardProps[]>> {
  try {
    await connectDB();

    // Fetch products for all categories in parallel
    const productPromises = categories.map((category) =>
      getProductsByCategory(category._id, limit)
    );

    const productsArrays = await Promise.all(productPromises);

    // Create a map of category ID to products
    const productsMap = new Map<string, ProductCardProps[]>();
    categories.forEach((category, index) => {
      productsMap.set(category._id, productsArrays[index] || []);
    });

    return productsMap;
  } catch {
    return new Map();
  }
}
