"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import {
  Download,
  Search,
  Filter,
  Calendar,
  User,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Gift,
  Eye,
} from "lucide-react";

interface DownloadRecord {
  _id: string;
  templateId: {
    _id: string;
    name: string;
    thumbnail: string;
    slug: string;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface DownloadStats {
  totalDownloads: number;
  todayDownloads: number;
  weekDownloads: number;
  monthDownloads: number;
  topTemplates: Array<{
    _id: string;
    name: string;
    downloads: number;
  }>;
}

export default function DownloadsPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard.downloads");
  const isArabic = locale === "ar";

  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDownloads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (dateFilter !== "all") params.set("period", dateFilter);
      params.set("page", currentPage.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/admin/downloads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDownloads(data.downloads || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch downloads:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, dateFilter, currentPage]);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    trend,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    trend?: string;
  }) => (
    <div className="bg-surface-card rounded-xl border border-white/10 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        </div>
        {trend && (
          <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title") || "Downloads"}</h1>
            <p className="text-sm text-gray-400">{t("subtitle") || "Track free template downloads"}</p>
          </div>
        </div>

        <button
          onClick={fetchDownloads}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t("refresh") || "Refresh"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Download}
            label={t("totalDownloads") || "Total Downloads"}
            value={stats.totalDownloads.toLocaleString()}
            color="bg-blue-500/20 text-blue-400"
          />
          <StatCard
            icon={Calendar}
            label={t("todayDownloads") || "Today"}
            value={stats.todayDownloads}
            color="bg-green-500/20 text-green-400"
            trend="+12%"
          />
          <StatCard
            icon={TrendingUp}
            label={t("weekDownloads") || "This Week"}
            value={stats.weekDownloads}
            color="bg-primary-500/20 text-primary-400"
          />
          <StatCard
            icon={Gift}
            label={t("monthDownloads") || "This Month"}
            value={stats.monthDownloads}
            color="bg-purple-500/20 text-purple-400"
          />
        </div>
      )}

      {/* Top Downloaded Templates */}
      {stats?.topTemplates && stats.topTemplates.length > 0 && (
        <div className="bg-surface-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            {t("topTemplates") || "Top Downloaded Templates"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.topTemplates.slice(0, 5).map((template, index) => (
              <div
                key={template._id}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg"
              >
                <span className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{template.name}</p>
                  <p className="text-xs text-gray-500">{template.downloads} {t("downloads") || "downloads"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute ${isArabic ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("searchPlaceholder") || "Search by template name..."}
              className={`w-full ${isArabic ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="all">{t("filterAll") || "All Time"}</option>
              <option value="today">{t("filterToday") || "Today"}</option>
              <option value="week">{t("filterWeek") || "This Week"}</option>
              <option value="month">{t("filterMonth") || "This Month"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Downloads Table */}
      <div className="bg-surface-card rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : downloads.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Download className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t("noDownloads") || "No downloads found"}</h3>
            <p className="text-gray-500">{t("noDownloadsDesc") || "Downloads will appear here when users download free templates"}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30 border-b border-white/10">
                  <tr>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-6 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("template") || "Template"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("user") || "User"}
                    </th>
                    <th className={`${isArabic ? "text-right" : "text-left"} py-4 px-4 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("date") || "Date"}
                    </th>
                    <th className={`${isArabic ? "text-left" : "text-right"} py-4 px-6 text-sm font-semibold text-gray-400 uppercase`}>
                      {t("actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {downloads.map((download, index) => (
                    <motion.tr
                      key={download._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded bg-black/50 border border-white/10 overflow-hidden relative">
                            {download.templateId?.thumbnail && (
                              <Image
                                src={download.templateId.thumbnail}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{download.templateId?.name || "Unknown"}</p>
                            <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                              <Gift className="w-3 h-3" />
                              {t("free") || "Free"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-400" />
                          </div>
                          <div>
                            {download.userId ? (
                              <>
                                <p className="text-white font-medium">{download.userId.name}</p>
                                <p className="text-xs text-gray-500">{download.userId.email}</p>
                              </>
                            ) : (
                              <p className="text-gray-400">{t("guest") || "Guest User"}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(download.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`flex items-center gap-2 ${isArabic ? "justify-start" : "justify-end"}`}>
                          {download.templateId?.slug && (
                            <a
                              href={`/${locale}/templates/${download.templateId.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {downloads.map((download, index) => (
                <motion.div
                  key={download._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black/30 rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-8 rounded bg-black/50 border border-white/10 overflow-hidden relative">
                      {download.templateId?.thumbnail && (
                        <Image
                          src={download.templateId.thumbnail}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium truncate">{download.templateId?.name || "Unknown"}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                        <Gift className="w-3 h-3" />
                        {t("free") || "Free"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      {download.userId?.name || t("guest") || "Guest"}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(download.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <span className="px-4 py-2 text-white font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
