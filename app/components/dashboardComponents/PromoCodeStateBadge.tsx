import React from "react";
import { PromoCodeState } from "@/app/types/types";

interface PromoCodeStateBadgeProps {
  state: PromoCodeState;
}

const PromoCodeStateBadge: React.FC<PromoCodeStateBadgeProps> = ({ state }) => {
  const getStateColor = (state: PromoCodeState) => {
    switch (state) {
      case PromoCodeState.ACTIVE:
        return "bg-green-100 text-green-800";
      case PromoCodeState.EXPIRED:
        return "bg-red-100 text-red-800";
      case PromoCodeState.INACTIVE:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(
        state
      )}`}
    >
      {state}
    </span>
  );
};

export default PromoCodeStateBadge;

