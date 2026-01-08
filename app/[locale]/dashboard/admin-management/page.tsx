"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Users, Plus, Search, X, Loader2, Shield, ShieldCheck, ShieldOff, Mail, User, Calendar, CheckCircle, AlertCircle } from "lucide-react";

interface Admin {
  _id: string;
  name: string;
  email: string;
  image?: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminManagementPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard.adminManagement");
  const isArabic = locale === "ar";

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setToast({ type: "error", message: t("emailRequired") || "Email is required" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add admin");
      }

      setToast({ type: "success", message: t("addSuccess") || "Admin added successfully" });
      setShowAddModal(false);
      setEmail("");
      fetchAdmins();
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to add admin" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAdmin = async (id: string) => {
    setRevoking(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to revoke admin");

      setToast({ type: "success", message: t("revokeSuccess") || "Admin access revoked" });
      setRevokeConfirm(null);
      fetchAdmins();
    } catch {
      setToast({ type: "error", message: t("revokeError") || "Failed to revoke admin" });
    } finally {
      setRevoking(null);
    }
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-20 left-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
              toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 p-1 hover:bg-white/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title") || "Admin Management"}</h1>
            <p className="text-sm text-gray-400">{t("subtitle") || "Manage administrator access"}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-black font-semibold rounded-xl shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          {t("addAdmin") || "Add Admin"}
        </button>
      </div>

      <div className="bg-surface-card rounded-xl border border-white/10 p-4">
        <div className="relative">
          <Search className={`absolute ${isArabic ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder") || "Search admins..."}
            className={`w-full ${isArabic ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30`}
          />
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl border border-white/10 overflow-hidden">
        {filteredAdmins.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">{t("noAdmins") || "No admins found"}</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-5 py-3 bg-primary-500 text-black font-semibold rounded-xl"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              {t("addAdmin") || "Add Admin"}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredAdmins.map((admin, index) => (
              <motion.div
                key={admin._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {admin.image ? (
                      <Image src={admin.image} alt={admin.name} width={48} height={48} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-black" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white truncate">{admin.name}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {admin.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(admin.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {revokeConfirm === admin._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRevokeAdmin(admin._id)}
                          disabled={revoking === admin._id}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                        >
                          {revoking === admin._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setRevokeConfirm(null)}
                          className="p-2 text-gray-400 hover:bg-white/10 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRevokeConfirm(admin._id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title={t("revokeAccess") || "Revoke Access"}
                      >
                        <ShieldOff className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-surface-card rounded-2xl border border-white/10 max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{t("addAdmin") || "Add Admin"}</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t("userEmail") || "User Email"} *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="admin@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t("emailHint") || "The user must already have an account"}
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 px-4 bg-white/10 text-white font-medium rounded-xl"
                  >
                    {t("cancel") || "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-4 bg-primary-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        {t("grantAccess") || "Grant Access"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}