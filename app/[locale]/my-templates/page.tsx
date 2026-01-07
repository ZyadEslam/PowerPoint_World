"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Package,
  Calendar,
  Eye,
  Sparkles,
  CheckCircle,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";
import FuturisticBackground from "@/app/components/ui/FuturisticBackground";

interface Purchase {
  _id: string;
  templateId: {
    _id: string;
    name: string;
    slug: string;
    thumbnail: string;
    categoryName: string;
  };
  templateSnapshot: {
    name: string;
    thumbnail: string;
    categoryName: string;
    fileName: string;
  };
  purchasePrice: number;
  paymentStatus: string;
  status: string;
  downloadCount: number;
  receiptNumber: string;
  createdAt: string;
  lastDownloadAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function MyTemplatesContent() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("myTemplates");

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for success message from payment callback
  useEffect(() => {
    if (searchParams.get("purchase") === "success") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/my-templates`);
    }
  }, [authStatus, router, locale]);

  // Fetch purchases
  useEffect(() => {
    const fetchPurchases = async () => {
      if (authStatus !== "authenticated") return;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/purchases?page=${currentPage}&limit=12&status=paid`
        );
        const data = await res.json();
        setPurchases(data.purchases || []);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Failed to fetch purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [authStatus, currentPage]);

  // Handle download
  const handleDownload = async (purchaseId: string) => {
    setDownloadingId(purchaseId);
    try {
      const res = await fetch(`/api/purchases/download/${purchaseId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Download failed");
      }

      if (data.downloadUrl) {
        // Create a temporary link to download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName || "template.pptx";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update local state to reflect new download count
        setPurchases((prev) =>
          prev.map((p) =>
            p._id === purchaseId
              ? {
                  ...p,
                  downloadCount: data.downloadCount,
                  lastDownloadAt: new Date().toISOString(),
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download template. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (authStatus === "loading") {
    return (
      <main className="relative min-h-screen pt-24 pb-16">
        <FuturisticBackground showGrid showOrbs={false} showHexPattern={false} />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pt-24 pb-16">
      <FuturisticBackground showGrid showOrbs={false} showHexPattern={false} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl bg-green-500/90 backdrop-blur-sm text-white flex items-center gap-3 shadow-2xl"
            >
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">
                  {t("purchaseSuccess") || "Purchase Successful!"}
                </p>
                <p className="text-sm text-white/80">
                  {t("downloadReady") || "Your template is ready to download"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {t("title") || "My Templates"}
                  </h1>
                  <p className="text-gray-400">
                    {t("subtitle") || "Access your purchased templates"}
                  </p>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-primary-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-primary-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t("totalTemplates") || "Total Templates"}
                </p>
                <p className="text-2xl font-bold text-white">
                  {pagination?.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Download className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t("totalDownloads") || "Total Downloads"}
                </p>
                <p className="text-2xl font-bold text-white">
                  {purchases.reduce((sum, p) => sum + (p.downloadCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t("memberSince") || "Member Since"}
                </p>
                <p className="text-lg font-bold text-white">
                  {session?.user?.name?.split(" ")[0] || "User"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("noTemplates") || "No templates yet"}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {t("noTemplatesDesc") ||
                "You haven't purchased any templates yet. Browse our collection to find the perfect template."}
            </p>
            <Link
              href={`/${locale}/templates`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all"
            >
              <Sparkles className="w-5 h-5" />
              {t("browseTemplates") || "Browse Templates"}
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {purchases.map((purchase, index) => (
                  <PurchaseCard
                    key={purchase._id}
                    purchase={purchase}
                    index={index}
                    viewMode={viewMode}
                    locale={locale}
                    onDownload={handleDownload}
                    isDownloading={downloadingId === purchase._id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-2 mt-12"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  {t("prev") || "Previous"}
                </button>

                <span className="px-4 py-2 text-white">
                  {currentPage} / {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  {t("next") || "Next"}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// Purchase Card Component
function PurchaseCard({
  purchase,
  index,
  viewMode,
  locale,
  onDownload,
  isDownloading,
}: {
  purchase: Purchase;
  index: number;
  viewMode: "grid" | "list";
  locale: string;
  onDownload: (id: string) => void;
  isDownloading: boolean;
}) {
  const template = purchase.templateId || purchase.templateSnapshot;
  const purchaseDate = new Date(purchase.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all duration-300 ${
        viewMode === "list" ? "flex" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden ${
          viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-video"
        }`}
      >
        <Image
          src={template.thumbnail}
          alt={template.name}
          fill
          className="object-cover"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
          <span className="text-xs font-semibold text-white flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Owned
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={`p-5 ${viewMode === "list" ? "flex-1 flex flex-col" : ""}`}>
        {/* Category */}
        <p className="text-xs font-medium text-primary-400 mb-2">
          {template.categoryName}
        </p>

        {/* Title */}
        <h3 className="font-semibold text-white text-lg mb-3 line-clamp-1">
          {template.name}
        </h3>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {purchaseDate}
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {purchase.downloadCount || 0} downloads
          </div>
        </div>

        {/* Receipt */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-gray-500">Receipt Number</p>
          <p className="text-sm text-white font-mono">{purchase.receiptNumber}</p>
        </div>

        {/* Actions */}
        <div
          className={`flex gap-3 ${viewMode === "list" ? "mt-auto" : ""}`}
        >
          <button
            onClick={() => onDownload(purchase._id)}
            disabled={isDownloading}
            className="flex-1 py-3 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </button>

          {purchase.templateId?.slug && (
            <Link
              href={`/${locale}/templates/${purchase.templateId.slug}`}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all"
            >
              <Eye className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Export with Suspense boundary
export default function MyTemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
      }
    >
      <MyTemplatesContent />
    </Suspense>
  );
}

