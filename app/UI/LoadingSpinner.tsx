"use client";
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingSpinner = ({
  size = "md",
  text,
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`flex flex-col justify-center my-5 items-center ${className}`}
    >
      <div
        className={`${sizeClasses[size]} relative animate-spin`}
        style={{ animation: "spin 1s linear infinite" }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>

        {/* Animated arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary"></div>

        {/* Inner dot */}
        <div className="absolute top-1 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2"></div>
      </div>

      {text && (
        <p
          className={`${textSizeClasses[size]} text-gray-600 mt-3 font-medium`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
