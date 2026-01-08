"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Tag, Plus, Edit2, Trash2, X, Save, Calendar, Percent, CheckCircle, AlertCircle, XCircle, Clock, Copy, RefreshCw } from "lucide-react";
import { PromoCodeState } from "@/app/types/types";
import { usePromoCodes, PromoCode, PromoCodeFormData } from "@/app/hooks/usePromoCodes";

export default function PromoCodesPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard.promoCodes");

  const { promoCodes, loading, error, success, createPromoCode, updatePromoCode, deletePromoCode } = usePromoCodes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    discountPercentage: "",
    startDate: "",
    endDate: "",
    state: PromoCodeState.INACTIVE,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleOpenModal = () => {
    setEditingCode(null);
    setFormData({ code: "", discountPercentage: "", startDate: "", endDate: "", state: PromoCodeState.INACTIVE });
    setIsModalOpen(true);
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    setFormData({
      code: promoCode.code,
      discountPercentage: promoCode.discountPercentage.toString(),
      startDate: promoCode.startDate.split("T")[0],
      endDate: promoCode.endDate.split("T")[0],
      state: promoCode.state,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCode(null);
    setFormData({ code: "", discountPercentage: "", startDate: "", endDate: "", state: PromoCodeState.INACTIVE });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = editingCode ? await updatePromoCode(editingCode._id, formData) : await createPromoCode(formData);
      if (result) handleCloseModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(id);
    await deletePromoCode(id);
    setDeleting(null);
    setDeleteConfirm(null);
  }, [deletePromoCode]);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData((prev) => ({ ...prev, code }));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const getStatusBadge = (state: PromoCodeState) => {
    const config = {
      [PromoCodeState.ACTIVE]: { icon: CheckCircle, className: "bg-green-500/20 text-green-400", label: "Active" },
      [PromoCodeState.INACTIVE]: { icon: XCircle, className: "bg-gray-500/20 text-gray-400", label: "Inactive" },
      [PromoCodeState.EXPIRED]: { icon: Clock, className: "bg-red-500/20 text-red-400", label: "Expired" },
    };
    const statusConfig = config[state];
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {statusConfig.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-300">{success}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Tag className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title") || "Promo Codes"}</h1>
            <p className="text-sm text-gray-400">{t("subtitle") || "Manage discount codes"}</p>
          </div>
        </div>
        <button onClick={handleOpenModal} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-black font-semibold rounded-xl shadow-lg shadow-primary-500/20">
          <Plus className="w-5 h-5" />
          {t("createButton") || "Add Promo Code"}
        </button>
      </div>

      <div className="bg-surface-card rounded-2xl border border-white/10 overflow-hidden">
        {promoCodes.length === 0 ? (
          <div className="p-16 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">{t("table.noPromoCodes") || "No promo codes"}</h3>
            <button onClick={handleOpenModal} className="mt-4 px-5 py-3 bg-primary-500 text-black font-semibold rounded-xl">
              <Plus className="w-5 h-5 inline mr-2" />
              {t("createButton") || "Add Promo Code"}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {promoCodes.map((code, index) => (
              <motion.div key={code._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-6 hover:bg-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => copyToClipboard(code.code)} className="font-mono text-xl font-bold text-primary-400 hover:text-primary-300 flex items-center gap-2">
                        {code.code}
                        <Copy className="w-4 h-4" />
                      </button>
                      {getStatusBadge(code.state)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Percent className="w-4 h-4" />{code.discountPercentage}% discount</span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(code.startDate)} - {formatDate(code.endDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(code)} className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    {deleteConfirm === code._id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(code._id)} disabled={deleting === code._id} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                          {deleting === code._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-2 text-gray-400 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(code._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={handleCloseModal}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-surface-card rounded-2xl border border-white/10 max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editingCode ? (t("form.editTitle") || "Edit Code") : (t("form.createTitle") || "Add Code")}</h2>
                <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t("form.code") || "Code"} *</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-mono uppercase" placeholder="SAVE20" />
                    <button type="button" onClick={generateRandomCode} className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl"><RefreshCw className="w-5 h-5" /></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t("form.discount") || "Discount %"} *</label>
                  <input type="number" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })} required min="1" max="100" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white" placeholder="20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t("form.startDate") || "Start"} *</label>
                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t("form.endDate") || "End"} *</label>
                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t("form.status") || "Status"}</label>
                  <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value as PromoCodeState })} className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white">
                    <option value={PromoCodeState.ACTIVE}>Active</option>
                    <option value={PromoCodeState.INACTIVE}>Inactive</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-3 px-4 bg-white/10 text-white font-medium rounded-xl">{t("form.cancel") || "Cancel"}</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 bg-primary-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" />{editingCode ? (t("form.update") || "Update") : (t("form.create") || "Create")}</>}
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
