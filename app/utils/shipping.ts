export interface ShippingFeesByRegion {
  insideCairoGiza: number;
  outsideCities: number;
}

const CITY_KEYWORDS = [
  "cairo",
  "giza",
  "القاهرة",
  "الجيزة",
  "al qahirah",
  "al giza",
];

/**
 * Returns true if the provided city string refers to Cairo or Giza
 */
export const isCairoOrGiza = (city?: string | null): boolean => {
  if (!city) return false;
  const normalized = city.toLowerCase().trim();
  return CITY_KEYWORDS.some((key) => normalized.includes(key));
};

/**
 * Calculates the delivery fee based on city selection and configured fees.
 */
export const getShippingFeeForCity = (
  city: string | undefined | null,
  fees: ShippingFeesByRegion
): number => {
  if (!fees) return 0;
  return isCairoOrGiza(city) ? fees.insideCairoGiza : fees.outsideCities;
};

