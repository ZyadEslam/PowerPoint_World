import mongoose from "mongoose";

export interface VariantInput {
  _id?: string;
  color: string;
  size: string;
  quantity: number;
  sku?: string;
}

export const sanitizeVariants = (variants: unknown): VariantInput[] => {
  if (!Array.isArray(variants)) return [];

  return variants
    .map((variant) => {
      if (
        !variant ||
        typeof variant !== "object" ||
        !("color" in variant) ||
        !("size" in variant)
      ) {
        return null;
      }

      const { color, size, quantity, sku, _id } = variant as {
        color?: string;
        size?: string;
        quantity?: number | string;
        sku?: string;
        _id?: string;
      };

      if (!color || !size) return null;

      const parsedQty = Number(quantity);

      return {
        _id:
          _id && mongoose.Types.ObjectId.isValid(_id)
            ? _id
            : new mongoose.Types.ObjectId().toString(),
        color: color.trim(),
        size: size.trim(),
        quantity: Number.isFinite(parsedQty) ? Math.max(0, parsedQty) : 0,
        ...(sku && { sku: sku.trim() }),
      };
    })
    .filter(Boolean) as VariantInput[];
};

