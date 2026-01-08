"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  FileText,
  Download,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Package,
  Star,
  DollarSign,
  Calendar,
  Activity,
  FolderTree,
  Tag,
} from "lucide-react";

interface DashboardStats {
  totalTemplates: number;
  freeTemplates: number;
  premiumTemplates: number;
  totalDownloads: number;
  totalPayments: number;
  totalRevenue: number;
  totalUsers: number;
  activeUsers: number;
  recentPurchases: Array<{
    _id: string;
    templateName: string;
    userName: string;
    amount: number;
    createdAt: string;
  }>;
  recentDownloads: Array<{
    _id: string;
    templateName: string;
    userName: string;
    createdAt: string;
  }>;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    orange: "from-primary-500/20 to-primary-600/5 text-primary-400",
    green: "from-green-500/20 to-green-600/5 text-green-400",
    blue: "from-blue-500/20 to-blue-600/5 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-card rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm ${
              changeType === "up"
                ? "text-green-400"
                : changeType === "down"
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {changeType === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : changeType === "down" ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
};

const QuickActionCard = ({
  icon: Icon,
  label,
  description,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: string;
}) => {
  const locale = useLocale();

  return (
    <Link href={`/${locale}${href}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-surface-card rounded-2xl border border-white/10 p-5 hover:border-primary-500/30 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold group-hover:text-primary-400 transition-colors">
              {label}
            </h3>
            <p className="text-sm text-gray-500 truncate">{description}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    </Link>
  );
};

const RecentActivityItem = ({
  icon: Icon,
  title,
  subtitle,
  time,
  amount,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  time: string;
  amount?: string;
}) => (
  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-primary-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white font-medium truncate">{title}</p>
      <p className="text-sm text-gray-500 truncate">{subtitle}</p>
    </div>
    <div className="text-right flex-shrink-0">
      {amount && <p className="text-green-400 font-semibold">{amount}</p>}
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);

export default function DashboardOverviewPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard.overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} EGP`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-card rounded-2xl border border-white/10 p-6 animate-pulse"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 mb-4" />
              <div className="h-8 w-24 bg-white/10 rounded mb-2" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {t("title") || "Dashboard Overview"}
          </h1>
          <p className="text-gray-400 mt-1">
            {t("subtitle") || "Welcome back! Here's what's happening."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          label={t("totalTemplates") || "Total Templates"}
          value={stats?.totalTemplates || 0}
          change="+12%"
          changeType="up"
          color="orange"
        />
        <StatCard
          icon={Download}
          label={t("totalDownloads") || "Total Downloads"}
          value={stats?.totalDownloads || 0}
          change="+8%"
          changeType="up"
          color="blue"
        />
        <StatCard
          icon={CreditCard}
          label={t("totalPayments") || "Total Payments"}
          value={stats?.totalPayments || 0}
          change="+15%"
          changeType="up"
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label={t("totalRevenue") || "Total Revenue"}
          value={formatCurrency(stats?.totalRevenue || 0)}
          change="+23%"
          changeType="up"
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-card rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-green-400" />
            <h3 className="text-gray-400">{t("freeTemplates") || "Free Templates"}</h3>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.freeTemplates || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-card rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-gray-400">{t("premiumTemplates") || "Premium Templates"}</h3>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.premiumTemplates || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-card rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-gray-400">{t("activeUsers") || "Active Users"}</h3>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.activeUsers || 0}</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          {t("quickActions") || "Quick Actions"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={FileText}
            label={t("addTemplate") || "Add Template"}
            description={t("addTemplateDesc") || "Create a new template"}
            href="/dashboard/templates/new"
            color="from-primary-500 to-primary-600"
          />
          <QuickActionCard
            icon={FolderTree}
            label={t("manageCategories") || "Manage Categories"}
            description={t("manageCategoriesDesc") || "Organize your templates"}
            href="/dashboard/categories"
            color="from-blue-500 to-blue-600"
          />
          <QuickActionCard
            icon={CreditCard}
            label={t("viewPayments") || "View Payments"}
            description={t("viewPaymentsDesc") || "Track your revenue"}
            href="/dashboard/payments"
            color="from-green-500 to-green-600"
          />
          <QuickActionCard
            icon={Tag}
            label={t("promoCodes") || "Promo Codes"}
            description={t("promoCodesDesc") || "Manage discounts"}
            href="/dashboard/promo-codes"
            color="from-purple-500 to-purple-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface-card rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">
                {t("recentPurchases") || "Recent Purchases"}
              </h2>
            </div>
            <Link
              href={`/${locale}/dashboard/payments`}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              {t("viewAll") || "View All"}
            </Link>
          </div>

          <div className="space-y-1">
            {stats?.recentPurchases && stats.recentPurchases.length > 0 ? (
              stats.recentPurchases.slice(0, 5).map((purchase) => (
                <RecentActivityItem
                  key={purchase._id}
                  icon={CreditCard}
                  title={purchase.templateName}
                  subtitle={purchase.userName}
                  time={formatDate(purchase.createdAt)}
                  amount={formatCurrency(purchase.amount)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("noPurchases") || "No recent purchases"}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Downloads */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface-card rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">
                {t("recentDownloads") || "Recent Downloads"}
              </h2>
            </div>
            <Link
              href={`/${locale}/dashboard/downloads`}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              {t("viewAll") || "View All"}
            </Link>
          </div>

          <div className="space-y-1">
            {stats?.recentDownloads && stats.recentDownloads.length > 0 ? (
              stats.recentDownloads.slice(0, 5).map((download) => (
                <RecentActivityItem
                  key={download._id}
                  icon={Download}
                  title={download.templateName}
                  subtitle={download.userName}
                  time={formatDate(download.createdAt)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("noDownloads") || "No recent downloads"}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
