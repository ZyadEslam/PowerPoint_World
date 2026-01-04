import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/app/models/product";
import connectDB from "@/app/utils/db";
import sharp from "sharp";
import { createHash } from "crypto";

// ============================================================================
// IN-MEMORY LRU CACHE FOR PROCESSED IMAGES
// ============================================================================
// This significantly reduces database load and improves response times
// by caching already-processed images in memory.

interface CacheEntry {
  buffer: Buffer;
  contentType: string;
  etag: string;
  timestamp: number;
}

class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private maxAge: number; // milliseconds

  constructor(maxSize = 100, maxAgeMinutes = 30) {
    this.maxSize = maxSize;
    this.maxAge = maxAgeMinutes * 60 * 1000;
  }

  private generateKey(
    id: string,
    index: number,
    width: number | null,
    height: number | null,
    quality: number,
    format: string
  ): string {
    return `${id}-${index}-${width || "auto"}-${height || "auto"}-${quality}-${format}`;
  }

  get(
    id: string,
    index: number,
    width: number | null,
    height: number | null,
    quality: number,
    format: string
  ): CacheEntry | null {
    const key = this.generateKey(id, index, width, height, quality, format);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(
    id: string,
    index: number,
    width: number | null,
    height: number | null,
    quality: number,
    format: string,
    buffer: Buffer,
    contentType: string,
    etag: string
  ): void {
    const key = this.generateKey(id, index, width, height, quality, format);

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      buffer,
      contentType,
      etag,
      timestamp: Date.now(),
    });
  }

  // Clear cache for a specific product (useful when product images are updated)
  invalidateProduct(id: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${id}-`)) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instance - persists across requests in serverless environment
// Increased cache size and TTL for better performance
const imageCache = new ImageCache(500, 120); // 500 images, 120 minutes TTL

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const url = new URL(request.url);
    const imageIndex = parseInt(url.searchParams.get("index") || "0");

    // Parse query parameters for image optimization
    const width = url.searchParams.get("w")
      ? parseInt(url.searchParams.get("w")!)
      : null;
    const height = url.searchParams.get("h")
      ? parseInt(url.searchParams.get("h")!)
      : null;
    const quality = url.searchParams.get("q")
      ? parseInt(url.searchParams.get("q")!)
      : 80; // Optimized default quality for better compression

    // Check Accept header for format preference
    const acceptHeader = request.headers.get("accept") || "";
    const prefersWebP = acceptHeader.includes("image/webp");
    const prefersAVIF = acceptHeader.includes("image/avif");

    // Determine output format - preserve PNG if original is PNG and no format preference
    let outputFormat: "jpeg" | "png" | "webp" | "avif" = "jpeg";
    if (prefersAVIF) {
      outputFormat = "avif";
    } else if (prefersWebP) {
      outputFormat = "webp";
    }
    // Note: PNG format will be determined later based on original content type if needed

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return new NextResponse("Invalid product ID", { status: 400 });
    }

    // Check in-memory cache first
    const cachedImage = imageCache.get(
      id,
      imageIndex,
      width,
      height,
      quality,
      outputFormat
    );
    if (cachedImage) {
      // Check if client has cached version
      const ifNoneMatch = request.headers.get("if-none-match");
      if (ifNoneMatch === `"${cachedImage.etag}"`) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: `"${cachedImage.etag}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      return new NextResponse(cachedImage.buffer, {
        headers: {
          "Content-Type": cachedImage.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": cachedImage.buffer.length.toString(),
          ETag: `"${cachedImage.etag}"`,
          Vary: "Accept",
          "X-Cache": "HIT", // Indicates cache hit for debugging
        },
      });
    }

    // Use aggregation to fetch ONLY the specific image we need, not the entire document
    // This is a MAJOR optimization - avoids loading all images into memory
    const result = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: {
          _id: 1,
          imageCount: { $size: { $ifNull: ["$imgSrc", []] } },
          image: { $arrayElemAt: ["$imgSrc", imageIndex] },
        },
      },
    ]);

    const product = result[0];

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    if (product.imageCount === 0) {
      return new NextResponse("No images found", { status: 404 });
    }

    if (imageIndex >= product.imageCount || imageIndex < 0) {
      return new NextResponse("Image index out of bounds", { status: 404 });
    }

    const imageData = product.image;

    // Check if the image data is valid (not empty)
    if (!imageData || imageData === "") {
      return new NextResponse("Empty image data", { status: 404 });
    }

    // Convert base64 to buffer with better error handling
    let imageBuffer: Buffer | undefined;
    let originalContentType = "image/jpeg"; // default

    try {
      let base64String: string | undefined;

      // Handle different possible formats of imageData
      if (typeof imageData === "string") {
        base64String = imageData;
      } else if (typeof imageData === "object") {
        // Handle MongoDB Binary objects
        if (imageData.base64) {
          base64String = imageData.base64;
        } else if (imageData.buffer) {
          // If it's already a buffer
          imageBuffer = Buffer.from(imageData.buffer);
        } else if (imageData.toString) {
          base64String = imageData.toString();
        } else {
          throw new Error("Unknown image data format");
        }
      } else {
        throw new Error("Unsupported image data type");
      }

      // Process base64 string if we have one
      if (base64String && !imageBuffer) {
        // Extract content type from data URL if present
        const dataUrlMatch = base64String.match(/^data:image\/(\w+);base64,/);
        if (dataUrlMatch) {
          originalContentType = `image/${dataUrlMatch[1]}`;
          base64String = base64String.replace(/^data:image\/\w+;base64,/, "");
        }

        // Validate base64 string
        if (!base64String || base64String.length === 0) {
          throw new Error("Empty base64 string");
        }

        // Check if it's valid base64
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64String)) {
          throw new Error("Invalid base64 format");
        }

        imageBuffer = Buffer.from(base64String, "base64");
      }

      // Validate buffer
      if (!imageBuffer || imageBuffer.length === 0) {
        return NextResponse.json(
          { message: "Empty image buffer" },
          { status: 500 }
        );
      }

      // Basic image validation - check for common image headers
      const header = imageBuffer.subarray(0, 4);
      if (header[0] === 0xff && header[1] === 0xd8) {
        originalContentType = "image/jpeg";
      } else if (
        header[0] === 0x89 &&
        header[1] === 0x50 &&
        header[2] === 0x4e &&
        header[3] === 0x47
      ) {
        originalContentType = "image/png";
      } else if (
        header[0] === 0x47 &&
        header[1] === 0x49 &&
        header[2] === 0x46
      ) {
        originalContentType = "image/gif";
      }
    } catch {
      return new NextResponse("Invalid image format", { status: 500 });
    }

    // Process image with Sharp
    try {
      let sharpInstance = sharp(imageBuffer);

      // Get original image metadata
      const metadata = await sharpInstance.metadata();

      // Determine resize dimensions
      let resizeWidth = width;
      let resizeHeight = height;

      // If only one dimension is provided, maintain aspect ratio
      if (width && !height && metadata.height) {
        resizeHeight = Math.round((width / metadata.width!) * metadata.height);
      } else if (height && !width && metadata.width) {
        resizeWidth = Math.round((height / metadata.height!) * metadata.width);
      }

      // Only resize if dimensions are provided and different from original
      // Use more aggressive resizing to ensure we don't serve oversized images
      if (resizeWidth || resizeHeight) {
        // Always resize to requested dimensions if provided, even if same size
        // This ensures proper compression and format conversion
        const targetWidth = resizeWidth || metadata.width;
        const targetHeight = resizeHeight || metadata.height;

        if (targetWidth && targetHeight) {
          sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
            fit: "inside",
            withoutEnlargement: true, // Don't upscale images
          });
        }
      }

      // Convert to desired format and optimize
      // Preserve PNG format if original is PNG and no format preference
      const preservePNG =
        originalContentType === "image/png" &&
        outputFormat === "jpeg" &&
        !prefersAVIF &&
        !prefersWebP;

      let optimizedBuffer: Buffer;
      let finalContentType: string;

      if (preservePNG) {
        // Preserve PNG format for PNG originals with fast compression
        optimizedBuffer = await sharpInstance
          .png({
            quality: Math.min(quality, 100),
            compressionLevel: 6, // Reduced for faster processing
            effort: 4, // Reduced effort for speed
          })
          .toBuffer();
        finalContentType = "image/png";
      } else {
        // Use preferred format or convert to JPEG with fast compression
        switch (outputFormat) {
          case "avif":
            optimizedBuffer = await sharpInstance
              .avif({
                quality: Math.min(quality, 80), // Slightly lower for faster encode
                effort: 3, // Reduced effort for faster processing
              })
              .toBuffer();
            finalContentType = "image/avif";
            break;
          case "webp":
            optimizedBuffer = await sharpInstance
              .webp({
                quality: Math.min(quality, 80), // Slightly lower for faster encode
                effort: 3, // Reduced effort for faster processing
              })
              .toBuffer();
            finalContentType = "image/webp";
            break;
          default: // jpeg
            optimizedBuffer = await sharpInstance
              .jpeg({
                quality: Math.min(quality, 80), // Slightly lower for faster encode
                mozjpeg: false, // Disable mozjpeg for much faster encoding
                progressive: true, // Progressive JPEG for better perceived performance
              })
              .toBuffer();
            finalContentType = "image/jpeg";
        }
      }

      // Generate ETag for caching
      const etag = createHash("md5").update(optimizedBuffer).digest("hex");

      // Store in cache for future requests
      imageCache.set(
        id,
        imageIndex,
        width,
        height,
        quality,
        outputFormat,
        optimizedBuffer,
        finalContentType,
        etag
      );

      // Check if client has cached version
      const ifNoneMatch = request.headers.get("if-none-match");
      if (ifNoneMatch === `"${etag}"`) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: `"${etag}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      return new NextResponse(optimizedBuffer, {
        headers: {
          "Content-Type": finalContentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": optimizedBuffer.length.toString(),
          ETag: `"${etag}"`,
          Vary: "Accept",
          "X-Cache": "MISS", // Indicates cache miss for debugging
        },
      });
    } catch (error) {
      console.error(
        `Error processing image with Sharp for product ${id}:`,
        error
      );
      // Fallback to original image if Sharp processing fails
      const etag = createHash("md5").update(imageBuffer).digest("hex");
      const ifNoneMatch = request.headers.get("if-none-match");
      if (ifNoneMatch === `"${etag}"`) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: `"${etag}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": originalContentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": imageBuffer.length.toString(),
          ETag: `"${etag}"`,
        },
      });
    }
  } catch {
    return new NextResponse("Error serving image", { status: 500 });
  }
}

// Note: imageCache is internal to this module
// For cache invalidation when products are updated, the cache will automatically
// expire based on TTL (60 minutes), or you can call the image API with cache-busting params
