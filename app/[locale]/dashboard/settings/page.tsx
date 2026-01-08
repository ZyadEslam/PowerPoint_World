"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Settings, Globe, Bell, Shield, Database, Palette } from "lucide-react";

export default function SettingsPage() {
  useLocale();
  const t = useTranslations("dashboard.settings");

  const settingsSections = [
    {
      icon: Globe,
      title: t("general.title") || "General Settings",
      description: t("general.description") || "Manage site name, logo, and basic settings",
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      icon: Bell,
      title: t("notifications.title") || "Notifications",
      description: t("notifications.description") || "Configure email and push notifications",
      color: "bg-yellow-500/20 text-yellow-400",
    },
    {
      icon: Shield,
      title: t("security.title") || "Security",
      description: t("security.description") || "Manage security settings and access controls",
      color: "bg-red-500/20 text-red-400",
    },
    {
      icon: Database,
      title: t("data.title") || "Data Management",
      description: t("data.description") || "Export data, backups, and maintenance",
      color: "bg-green-500/20 text-green-400",
    },
    {
      icon: Palette,
      title: t("appearance.title") || "Appearance",
      description: t("appearance.description") || "Customize the look and feel of your site",
      color: "bg-purple-500/20 text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title") || "Settings"}</h1>
          <p className="text-sm text-gray-400">{t("subtitle") || "Configure your dashboard"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={index}
              className="bg-surface-card rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{section.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface-card rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t("comingSoon") || "Coming Soon"}</h2>
        <p className="text-gray-400">
          {t("comingSoonDescription") || "More settings and customization options will be available in future updates."}
        </p>
      </div>
    </div>
  );
}
