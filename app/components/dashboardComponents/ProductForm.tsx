"use client";

import React, { useState, useRef, FormEvent, createContext } from "react";
import { addProduct } from "../../utils/actions";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ProductFormProps {
  children: React.ReactNode;
  onFormReset?: () => void;
}

type SubmissionState = "idle" | "loading" | "success" | "error";

export const ProductFormContext = createContext<{
  isLoading: boolean;
}>({
  isLoading: false,
});

const ProductFormComponent: React.FC<ProductFormProps> = ({
  children,
  onFormReset,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      await addProduct(formData);
      setState("success");

      // Clear form after successful submission
      if (formRef.current) {
        formRef.current.reset();
        // Call the reset callback to clear images and variants
        onFormReset?.();
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setState("idle");
      }, 3000);
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create product. Please try again."
      );
    }
  };

  const isLoading = state === "loading";

  return (
    <ProductFormContext.Provider value={{ isLoading }}>
      <div className="flex flex-col gap-6">
        {/* Status Messages */}
        {state === "loading" && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Creating product...</span>
          </div>
        )}

        {state === "success" && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Product created successfully!</span>
          </div>
        )}

        {state === "error" && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">
              {errorMessage || "Failed to create product. Please try again."}
            </span>
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {children}
        </form>
      </div>
    </ProductFormContext.Provider>
  );
};

export default ProductFormComponent;
