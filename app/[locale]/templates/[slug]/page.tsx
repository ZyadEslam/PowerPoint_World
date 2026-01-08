"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Play,
  Download,
  Star,
  Eye,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  FileText,
  Layers,
  Monitor,
  Shield,
  Loader2,
} from "lucide-react";
import FuturisticBackground from "@/app/components/ui/FuturisticBackground";

interface TemplateImage {
  _id: string;
  url: string;
  alt: string;
  order: number;
}

interface Template {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number;
  videoUrl?: string;
  videoThumbnail?: string;
  images: TemplateImage[];
  thumbnail: string;
  categoryName: string;
  category: string;
  tags: string[];
  slides?: number;
  aspectRatio?: string;
  fileType?: string;
  fileSize?: string;
  rating: number;
  reviewCount: number;
  purchaseCount: number;
  viewCount: number;
  isFeatured: boolean;
  hasPurchased?: boolean;
}

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const locale = useLocale();
  const router = useRouter();
  const { status } = useSession();
  const t = useTranslations("templateDetail");

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Fetch template
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/templates/${slug}`);
        if (!res.ok) throw new Error("Template not found");
        const data = await res.json();
        setTemplate(data.template);
      } catch (error) {
        console.error("Failed to fetch template:", error);
        router.push(`/${locale}/templates`);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [slug, locale, router]);

  // Handle purchase
  const handlePurchase = async () => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/templates/${slug}`);
      return;
    }

    if (!template) return;

    setPurchasing(true);
    try {
      // Create purchase record
      const purchaseRes = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template._id }),
      });

      if (!purchaseRes.ok) {
        const error = await purchaseRes.json();
        throw new Error(error.error || "Failed to create purchase");
      }

      const purchaseData = await purchaseRes.json();

      // For free templates, complete purchase immediately without payment
      if (template.price === 0) {
        const freeRes = await fetch("/api/purchases/complete-free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ purchaseId: purchaseData.purchase.id }),
        });

        if (!freeRes.ok) {
          const error = await freeRes.json();
          throw new Error(error.error || "Failed to complete free purchase");
        }

        // Refresh the page to show download button
        window.location.reload();
        return;
      }

      // For paid templates, initiate Paymob payment
      const paymentRes = await fetch("/api/paymob/template-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: purchaseData.purchase.id }),
      });

      if (!paymentRes.ok) {
        const error = await paymentRes.json();
        throw new Error(error.error || "Payment initialization failed");
      }

      const paymentData = await paymentRes.json();

      // Redirect to Paymob iframe
      if (paymentData.iframeUrl) {
        window.location.href = paymentData.iframeUrl;
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert(error instanceof Error ? error.message : "Failed to purchase");
    } finally {
      setPurchasing(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!template) return;

    try {
      // Get purchases and find the one for this template
      const res = await fetch("/api/purchases");
      const data = await res.json();
      const purchase = data.purchases?.find(
        (p: { templateId: { _id: string } }) =>
          p.templateId?._id === template._id
      );

      if (!purchase) {
        alert("Purchase not found");
        return;
      }

      const downloadRes = await fetch(`/api/purchases/download/${purchase._id}`);
      const downloadData = await downloadRes.json();

      if (downloadData.downloadUrl) {
        // Create a temporary link to download
        const link = document.createElement("a");
        link.href = downloadData.downloadUrl;
        link.download = downloadData.fileName || "template.pptx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download template");
    }
  };

  // Image navigation
  const nextImage = useCallback(() => {
    if (template) {
      setCurrentImageIndex((prev) =>
        prev === template.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [template]);

  const prevImage = useCallback(() => {
    if (template) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? template.images.length - 1 : prev - 1
      );
    }
  }, [template]);

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <main className="relative min-h-screen pt-24 pb-16">
        <FuturisticBackground showGrid showOrbs={false} showHexPattern={false} />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
      </main>
    );
  }

  if (!template) {
    return null;
  }

  const discount = template.oldPrice
    ? Math.round(
        ((template.oldPrice - template.price) / template.oldPrice) * 100
      )
    : 0;

  return (
    <main className="relative min-h-screen pt-24 pb-16">
      <FuturisticBackground showGrid showOrbs={false} showHexPattern={false} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-400 mb-8"
        >
          <Link
            href={`/${locale}/templates`}
            className="hover:text-white transition-colors"
          >
            {t("templates") || "Templates"}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-400">{template.categoryName}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{template.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Media Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Main Image/Video */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/40 border border-white/10">
              {template.videoUrl && !showImageModal ? (
                // Video Preview
                <div
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => setShowVideoModal(true)}
                >
                  <Image
                    src={
                      template.videoThumbnail ||
                      template.thumbnail ||
                      template.images[0]?.url
                    }
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className="w-20 h-20 rounded-full bg-primary-500/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
              ) : (
                // Image Slider
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    >
                      <Image
                        src={
                          template.images[currentImageIndex]?.url ||
                          template.thumbnail
                        }
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  {template.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Image Counter */}
              {template.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                  {currentImageIndex + 1} / {template.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {template.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {template.videoUrl && (
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 border-primary-500"
                  >
                    <Image
                      src={template.videoThumbnail || template.thumbnail}
                      alt="Video"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </button>
                )}
                {template.images.map((img, idx) => (
                  <button
                    key={img._id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? "border-primary-500"
                        : "border-transparent hover:border-white/30"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || template.name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Badge & Category */}
            <div className="flex items-center gap-3">
              {template.isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm">
                  <Sparkles className="w-4 h-4" />
                  {t("featured") || "Featured"}
                </span>
              )}
              <span className="text-sm text-gray-400">{template.categoryName}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {template.name}
            </h1>

            {/* Rating & Stats */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(template.rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-medium">
                  {template.rating.toFixed(1)}
                </span>
                <span className="text-gray-500">({template.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {template.viewCount} views
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {template.purchaseCount} sales
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed">{template.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4">
              {template.slides && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <Layers className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Slides</p>
                    <p className="text-white font-medium">{template.slides}</p>
                  </div>
                </div>
              )}
              {template.aspectRatio && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <Monitor className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Aspect Ratio</p>
                    <p className="text-white font-medium">{template.aspectRatio}</p>
                  </div>
                </div>
              )}
              {template.fileType && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <FileText className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Format</p>
                    <p className="text-white font-medium uppercase">
                      {template.fileType}
                    </p>
                  </div>
                </div>
              )}
              {template.fileSize && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">File Size</p>
                    <p className="text-white font-medium">{template.fileSize}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price & CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10">
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-bold text-white">
                  {template.price === 0 ? "Free" : `${template.price} EGP`}
                </span>
                {template.oldPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {template.oldPrice} EGP
                    </span>
                    <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-sm font-medium">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {template.hasPurchased ? (
                <button
                  onClick={handleDownload}
                  className="w-full py-4 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-5 h-5" />
                  {t("download") || "Download Template"}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("processing") || "Processing..."}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {template.price === 0
                        ? t("getFree") || "Get Free"
                        : t("buyNow") || "Buy Now"}
                    </>
                  )}
                </button>
              )}

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  Secure Payment
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Download className="w-4 h-4 text-primary-500" />
                  Instant Download
                </div>
              </div>
            </div>

            {/* Tags */}
            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/${locale}/templates?search=${tag}`}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && template.videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-primary-500 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {getYouTubeId(template.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(
                    template.videoUrl
                  )}?autoplay=1`}
                  className="w-full h-full rounded-xl"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  src={template.videoUrl}
                  className="w-full h-full rounded-xl"
                  controls
                  autoPlay
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 text-white hover:text-primary-500 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-6xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={template.images[currentImageIndex]?.url || template.thumbnail}
                alt={template.name}
                width={1920}
                height={1080}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {template.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === idx
                      ? "bg-primary-500 w-6"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

