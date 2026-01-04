import React from "react";
import { Tag, Calendar, User, Percent } from "lucide-react";
import { PromoCode } from "@/app/hooks/usePromoCodes";
import PromoCodeStateBadge from "./PromoCodeStateBadge";
import PromoCodeActionButtons from "./PromoCodeActionButtons";
import { useLocale, useTranslations } from "next-intl";
interface PromoCodeTableProps {
  promoCodes: PromoCode[];
  onEdit: (promoCode: PromoCode) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const PromoCodeTable: React.FC<PromoCodeTableProps> = ({
  promoCodes,
  onEdit,
  onDelete,
  deleting,
}) => {
  const t = useTranslations("dashboard.promoCodes");
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");
  const textAlign = isArabic ? "text-right" : "text-left";
  const thClass = `promo-code-table-th ${textAlign}`;
  const tdClass = `promo-code-table-td ${textAlign}`;
  if (promoCodes.length === 0) {
    return (
      <div className="p-12 text-center">
        <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t("table.noPromoCodes")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={thClass}>{t("table.code")}</th>
              <th className={thClass}>{t("table.discount")}</th>
              <th className={thClass}>{t("table.status")}</th>
              <th className={thClass}>{t("table.validity")}</th>
              <th className={thClass}>{t("table.usage")}</th>
              <th className={thClass}>{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promoCodes.map((promoCode) => (
              <tr key={promoCode._id} className="hover:bg-gray-50">
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="font-mono font-semibold text-gray-900">
                      {promoCode.code}
                    </span>
                  </div>
                </td>
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {promoCode.discountPercentage}%
                    </span>
                  </div>
                </td>
                <td className={tdClass}>
                  <PromoCodeStateBadge state={promoCode.state} />
                </td>
                <td className={tdClass}>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div>{formatDate(promoCode.startDate)}</div>
                      <div className="text-xs text-gray-400">to</div>
                      <div>{formatDate(promoCode.endDate)}</div>
                    </div>
                  </div>
                </td>
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {promoCode.author?.name ||
                        promoCode.author?.email ||
                        "Unknown"}
                    </span>
                  </div>
                </td>
                <td className={tdClass}>
                  <PromoCodeActionButtons
                    promoCode={promoCode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    deleting={deleting}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {promoCodes.map((promoCode) => (
          <div
            key={promoCode._id}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="font-mono font-semibold text-lg text-gray-900">
                  {promoCode.code}
                </span>
              </div>
              <PromoCodeStateBadge state={promoCode.state} />
            </div>

            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-semibold text-gray-900">
                {promoCode.discountPercentage}% {t("table.discount")}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <div>
                  <div>{formatDate(promoCode.startDate)}</div>
                  <div className="text-xs text-gray-400">{t("table.to")}</div>
                  <div className="text-xs text-gray-400">
                    {formatDate(promoCode.endDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  {promoCode.author?.name ||
                    promoCode.author?.email ||
                    t("table.unknown")}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <PromoCodeActionButtons
                promoCode={promoCode}
                onEdit={onEdit}
                onDelete={onDelete}
                deleting={deleting}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PromoCodeTable;
