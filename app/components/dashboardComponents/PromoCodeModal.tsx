import React from "react";
import { X } from "lucide-react";
import { PromoCodeFormData } from "@/app/hooks/usePromoCodes";
import PromoCodeForm from "./PromoCodeForm";

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formData: PromoCodeFormData;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (data: PromoCodeFormData) => void;
  submitting: boolean;
  isEdit: boolean;
}

const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  formData,
  onSubmit,
  onCancel,
  onChange,
  submitting,
  isEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <PromoCodeForm
          formData={formData}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onChange={onChange}
          submitting={submitting}
          isEdit={isEdit}
        />
      </div>
    </div>
  );
};

export default PromoCodeModal;

