"use client";
import React, { useState, useCallback } from "react";
import { Loader2, Tag } from "lucide-react";
import { PromoCodeState } from "@/app/types/types";
import {
  usePromoCodes,
  PromoCode,
  PromoCodeFormData,
} from "@/app/hooks/usePromoCodes";
import PromoCodeHeader from "./PromoCodeHeader";
import MessageBanner from "./MessageBanner";
import PromoCodeTable from "./PromoCodeTable";
import PromoCodeModal from "./PromoCodeModal";
import { useTranslations } from "next-intl";
const PromoCodeManagement = React.memo(() => {
  const {
    promoCodes,
    loading,
    error,
    success,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
  } = usePromoCodes();
  const t = useTranslations("dashboard.promoCodes");
  const tAdmin = useTranslations("dashboard.adminManagement");
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

  const handleOpenModal = () => {
    setEditingCode(null);
    setFormData({
      code: "",
      discountPercentage: "",
      startDate: "",
      endDate: "",
      state: PromoCodeState.INACTIVE,
    });
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
    setFormData({
      code: "",
      discountPercentage: "",
      startDate: "",
      endDate: "",
      state: PromoCodeState.INACTIVE,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const success = editingCode
        ? await updatePromoCode(editingCode._id, formData)
        : await createPromoCode(formData);

      if (success) {
        handleCloseModal();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm(tAdmin("deletePromoConfirm"))) {
        return;
      }

      setDeleting(id);
      await deletePromoCode(id);
      setDeleting(null);
    },
    [deletePromoCode, tAdmin]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PromoCodeHeader onCreateClick={handleOpenModal} />

      <MessageBanner type="error" message={error || ""} />
      <MessageBanner type="success" message={success || ""} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {promoCodes.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t("table.noPromoCodes")}</p>
            <button
              onClick={handleOpenModal}
              className="mt-4 text-orange hover:text-orange/80"
            >
              {t("createButton")}
            </button>
          </div>
        ) : (
          <PromoCodeTable
            promoCodes={promoCodes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleting={deleting}
          />
        )}
      </div>

      <PromoCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCode ? t("form.editTitle") : t("form.createTitle")}
        formData={formData}
        onSubmit={handleSubmit}
        onCancel={handleCloseModal}
        onChange={setFormData}
        submitting={submitting}
        isEdit={!!editingCode}
      />
    </div>
  );
});

PromoCodeManagement.displayName = "PromoCodeManagement";

export default PromoCodeManagement;
