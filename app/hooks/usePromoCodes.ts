import { useState, useEffect, useCallback } from "react";
import { PromoCodeState } from "@/app/types/types";
import { cachedFetchJson, cacheStrategies } from "@/app/utils/cachedFetch";

export interface PromoCode {
  _id: string;
  code: string;
  state: PromoCodeState;
  discountPercentage: number;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface UsePromoCodesReturn {
  promoCodes: PromoCode[];
  loading: boolean;
  error: string | null;
  success: string | null;
  fetchPromoCodes: () => Promise<void>;
  createPromoCode: (data: PromoCodeFormData) => Promise<boolean>;
  updatePromoCode: (id: string, data: PromoCodeFormData) => Promise<boolean>;
  deletePromoCode: (id: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

export interface PromoCodeFormData {
  code: string;
  discountPercentage: string;
  startDate: string;
  endDate: string;
  state: PromoCodeState;
}

export const usePromoCodes = (): UsePromoCodesReturn => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPromoCodes = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await cachedFetchJson<{ promoCodes: PromoCode[]; error?: string }>(
        "/api/promo-code",
        cacheStrategies.promoCodes(force)
      );

      if (data.error) {
        throw new Error(data.error);
      }

      setPromoCodes(data.promoCodes || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load promo codes"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createPromoCode = useCallback(
    async (formData: PromoCodeFormData): Promise<boolean> => {
      try {
        setError(null);
        setSuccess(null);

        const response = await fetch("/api/promo-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            discountPercentage: Number(formData.discountPercentage),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create promo code");
        }

        setSuccess("Promo code created successfully");
        await fetchPromoCodes(true); // Force refresh after create
        setTimeout(() => setSuccess(null), 3000);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create promo code"
        );
        return false;
      }
    },
    [fetchPromoCodes]
  );

  const updatePromoCode = useCallback(
    async (id: string, formData: PromoCodeFormData): Promise<boolean> => {
      try {
        setError(null);
        setSuccess(null);

        const response = await fetch("/api/promo-code", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            ...formData,
            discountPercentage: Number(formData.discountPercentage),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update promo code");
        }

        setSuccess("Promo code updated successfully");
        await fetchPromoCodes(true); // Force refresh after update
        setTimeout(() => setSuccess(null), 3000);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update promo code"
        );
        return false;
      }
    },
    [fetchPromoCodes]
  );

  const deletePromoCode = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);

        const response = await fetch(`/api/promo-code?id=${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to delete promo code");
        }

        setSuccess("Promo code deleted successfully");
        await fetchPromoCodes(true); // Force refresh after delete
        setTimeout(() => setSuccess(null), 3000);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete promo code"
        );
        return false;
      }
    },
    [fetchPromoCodes]
  );

  useEffect(() => {
    fetchPromoCodes();
    // Refresh every 30 seconds to update expired codes
    const interval = setInterval(fetchPromoCodes, 30000);
    return () => clearInterval(interval);
  }, [fetchPromoCodes]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        if (error) setError(null);
        if (success) setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return {
    promoCodes,
    loading,
    error,
    success,
    fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    setError,
    setSuccess,
  };
};

