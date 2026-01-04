import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    color: {
      type: String,
      required: [true, "Variant color is required"],
      trim: true,
    },
    size: {
      type: String,
      required: [true, "Variant size is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Variant quantity is required"],
      min: [0, "Variant quantity cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  rating: {
    type: Number,
    required: [true, "Product rating is required"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
  },
  oldPrice: {
    type: Number,
    required: [false],
  },
  discount: {
    type: Number,
    required: [false, "Product discount is not required"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Product category is required"],
  },
  categoryName: {
    type: String,
    required: [true, "Product category name is required"],
  },
  brand: {
    type: String,
    required: [true, "Product brand is required"],
  },

  imgSrc: {
    type: [Buffer],
    required: [true, "Product images are required"],
  },
  quantityInCart: {
    type: Number,
    required: false,
    default: 0,
  },
  hideFromHome: {
    type: Boolean,
    required: false,
    default: false,
  },
  variants: {
    type: [variantSchema],
    default: [],
    validate: [
      {
        validator: (variants: unknown[]) => Array.isArray(variants),
        message: "Product variants must be an array",
      },
    ],
  },
},
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("totalStock").get(function totalStock() {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce(
    (sum: number, variant: { quantity?: number }) => sum + (variant?.quantity || 0),
    0
  );
});

// Add indexes for efficient queries
productSchema.index({ category: 1, hideFromHome: 1 });
productSchema.index({ category: 1 });
productSchema.index({ "variants.size": 1, "variants.color": 1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema); // see if the user is already exist & if not create a new one
export default Product;
