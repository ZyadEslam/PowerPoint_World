import { Loader2 } from "lucide-react";
import React, { ReactNode } from "react";

const LoadingOverlay = ({
  isVisible,
  message = "Processing...",
  icon = null,
}: {
  isVisible: boolean;
  message: string;
  icon?: ReactNode;
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0  backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-30">
        {/* Spinning loader with custom icon */}
        <div className="mb-4 relative">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          {icon && (
            <div className="absolute inset-0 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>

        {/* Loading message */}
        <p className="text-lg font-medium text-gray-800 text-center">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
