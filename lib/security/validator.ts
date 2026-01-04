import { z } from "zod";
import mongoose from "mongoose";

// Helper to validate MongoDB ObjectId
const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

// Product validation schemas
export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(5000, "Description too long").optional(),
  price: z.number().positive("Price must be positive"),
  oldPrice: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  category: objectIdSchema.optional(),
  categoryName: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  hideFromHome: z.boolean().optional(),
  imgSrc: z
    .array(z.string().min(1, "Image data cannot be empty"))
    .min(1, "At least one product image is required")
    .max(4, "Maximum 4 images allowed"),
  variants: z
    .array(
      z.object({
        _id: z.string().optional(),
        color: z.string().min(1).max(50),
        size: z.string().min(1).max(50),
        quantity: z.number().int().min(0),
        sku: z.string().max(100).optional(),
      })
    )
    .optional(),
  totalStock: z.number().int().min(0).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// Order validation schemas
// Flexible schema that accepts cart items with various field names
export const orderItemSchema = z
  .object({
    _id: z.string().optional(),
    productId: z.string().optional(),
    variantId: z.union([objectIdSchema, z.string()]).optional(),
    selectedVariantId: z.union([objectIdSchema, z.string()]).optional(),
    size: z.string().max(50).optional(),
    selectedSize: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
    selectedColor: z.string().max(50).optional(),
    quantity: z
      .union([
        z.number().int().positive(),
        z.string().transform((val) => Number(val)),
      ])
      .optional(),
    quantityInCart: z
      .union([
        z.number().int().positive(),
        z.string().transform((val) => Number(val)),
      ])
      .optional(),
    price: z
      .union([
        z.number().nonnegative(),
        z.string().transform((val) => Number(val)),
      ])
      .optional(),
    variantSku: z.string().max(100).optional(),
    sku: z.string().max(100).optional(),
    // Allow any additional fields that might be in cart items (name, description, etc.)
  })
  .passthrough()
  .refine(
    (data) => {
      // At least one of quantity or quantityInCart must be present and positive
      const qty = data.quantity ?? data.quantityInCart;
      if (qty === undefined) return false;
      const numQty = typeof qty === "string" ? Number(qty) : qty;
      return Number.isInteger(numQty) && numQty > 0;
    },
    {
      message: "Quantity is required and must be a positive integer",
      path: ["quantity"],
    }
  )
  .refine(
    (data) => {
      // At least one product identifier must be present
      return !!(data._id || data.productId);
    },
    {
      message: "Product ID is required (_id or productId)",
      path: ["_id"],
    }
  );

const addressSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(10, "Phone number too short").max(20),
  address: z.string().min(5, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
});

export const orderCreateSchema = z
  .object({
    userId: objectIdSchema.optional(), // Optional for guest orders
    addressId: objectIdSchema.optional(),
    address: addressSchema.optional(),
    products: z.array(orderItemSchema).min(1, "At least one product required"),
    totalPrice: z.number().positive("Total price must be positive"),
    promoCode: z.string().max(50).optional(),
    discountAmount: z.number().min(0).optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    paymentMethod: z.enum(["cash_on_delivery", "paymob"]).optional(),
    paymobOrderId: z.string().max(200).optional(),
    paymobTransactionId: z.string().max(200).optional(),
    shippingFee: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      // Either addressId or address must be provided, but not both
      const hasAddressId = !!data.addressId;
      const hasAddress = !!data.address;
      return hasAddressId !== hasAddress; // XOR: exactly one must be true
    },
    {
      message: "Either addressId or address must be provided (but not both)",
      path: ["addressId"],
    }
  );

// User validation schemas
export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email("Invalid email format").optional(),
  isAdmin: z.boolean().optional(),
});

// Address validation schemas
export const addressCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(10, "Phone number too short").max(20),
  pinCode: z.string().min(4).max(10).optional(),
  address: z.string().min(5, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = addressCreateSchema.partial();

// Payment validation schemas (Paymob)
export const paymobPaymentSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount too large"), // Max 1,000,000 EGP
  billingData: z.object({
    name: z.string().min(1).max(100),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    phone: z.string().min(10).max(20),
    email: z.string().email().optional(),
    address: z.string().max(500).optional(),
    street: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    building: z.string().max(100).optional(),
    floor: z.string().max(50).optional(),
    apartment: z.string().max(50).optional(),
    postalCode: z.string().max(20).optional(),
  }),
  merchantOrderId: z.string().max(200).optional(),
});

// Category validation schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// Promo code validation schemas
export const promoCodeSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxUses: z.number().int().positive().optional(),
  minPurchaseAmount: z.number().min(0).optional(),
});

// Cart validation schema
export const cartItemSchema = z.object({
  productId: objectIdSchema,
  variantId: objectIdSchema.optional(),
  quantity: z.number().int().positive(),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
});

export const cartUpdateSchema = z.array(cartItemSchema);

// Validation helper function
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<
  { success: true; data: T } | { success: false; errors: z.ZodError }
> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Safe parse (doesn't throw)
export function safeParseInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
