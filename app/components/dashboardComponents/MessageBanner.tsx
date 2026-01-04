import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface MessageBannerProps {
  type: "error" | "success";
  message: string;
}

const MessageBanner: React.FC<MessageBannerProps> = ({ type, message }) => {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      className={`mb-4 sm:mb-6 p-3 sm:p-4 border rounded-lg flex items-center gap-2 sm:gap-3 ${
        isError
          ? "bg-red-50 border-red-200"
          : "bg-green-50 border-green-200"
      }`}
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
      )}
      <p className={`text-sm sm:text-base ${isError ? "text-red-800" : "text-green-800"}`}>
        {message}
      </p>
    </div>
  );
};

export default MessageBanner;

