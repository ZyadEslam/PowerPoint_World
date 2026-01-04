"use client";
import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2, XCircle, ShoppingCart } from "lucide-react";

interface toastProps {
  state: string;
  message: string;
  autoHide?: boolean;
  duration?: number;
  onDismiss?: () => void;
}

const Toast = ({
  state,
  message,
  autoHide = true,
  duration = 3000,
  onDismiss,
}: toastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const isSuccess = state === "success";
  const isAdded = message.toLowerCase().includes("added");
  const onDismissRef = useRef(onDismiss);

  // Update ref when onDismiss changes
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismissRef.current?.();
  };

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismissRef.current?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] min-w-[280px] max-w-[400px] rounded-xl shadow-2xl overflow-hidden ${
        isSuccess
          ? "bg-gradient-to-r from-green-500 to-green-600"
          : "bg-gradient-to-r from-red-500 to-red-600"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isSuccess ? (
            isAdded ? (
              <ShoppingCart className="w-5 h-5 text-white" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white" />
            )
          ) : (
            <XCircle className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message */}
        <p className="flex-1 text-white font-medium text-sm sm:text-base leading-tight">
          {message}
        </p>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Close notification"
        >
          <XCircle className="w-4 h-4 text-white opacity-80 hover:opacity-100" />
        </button>
      </div>

      {/* Progress Bar */}
      {autoHide && (
        <div className="h-1 bg-white/30" style={{ width: "100%" }}>
          <div
            className="h-full bg-white/50 transition-all ease-linear"
            style={{
              width: "0%",
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;
