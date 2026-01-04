import React from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { PromoCode } from "@/app/hooks/usePromoCodes";

interface PromoCodeActionButtonsProps {
  promoCode: PromoCode;
  onEdit: (promoCode: PromoCode) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
}

const PromoCodeActionButtons: React.FC<PromoCodeActionButtonsProps> = ({
  promoCode,
  onEdit,
  onDelete,
  deleting,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onEdit(promoCode)}
        className="text-orange hover:text-orange/80"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(promoCode._id)}
        disabled={deleting === promoCode._id}
        className="text-red-600 hover:text-red-800 disabled:opacity-50"
        title="Delete"
      >
        {deleting === promoCode._id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default PromoCodeActionButtons;

