import mongoose from "mongoose";

const templateImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Template slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Template description is required"],
    },
    shortDescription: {
      type: String,
      required: false,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: [true, "Template price is required"],
      min: [0, "Price cannot be negative"],
    },
    oldPrice: {
      type: Number,
      required: false,
    },
    discount: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    // Video preview (YouTube/Vimeo URL or uploaded video)
    videoUrl: {
      type: String,
      required: false,
    },
    videoThumbnail: {
      type: String,
      required: false,
    },
    // Template preview images
    images: {
      type: [templateImageSchema],
      validate: [
        {
          validator: (images: unknown[]) =>
            Array.isArray(images) && images.length > 0,
          message: "At least one image is required",
        },
      ],
    },
    // Main thumbnail image
    thumbnail: {
      type: String,
      required: [true, "Thumbnail image is required"],
    },
    // The actual template file to be downloaded
    fileUrl: {
      type: String,
      required: [true, "Template file URL is required"],
    },
    fileName: {
      type: String,
      required: [true, "Template file name is required"],
    },
    fileSize: {
      type: String,
      required: false,
    },
    fileType: {
      type: String,
      enum: ["pptx", "ppt", "key", "pdf", "zip", "other"],
      default: "pptx",
    },
    // Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Template category is required"],
    },
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
    },
    // Tags for better searchability
    tags: {
      type: [String],
      default: [],
    },
    // Template specs
    slides: {
      type: Number,
      required: false,
    },
    aspectRatio: {
      type: String,
      enum: ["16:9", "4:3", "1:1", "A4", "other"],
      default: "16:9",
    },
    // Pricing type
    isFree: {
      type: Boolean,
      default: false,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Stats
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    // SEO
    metaTitle: {
      type: String,
      required: false,
    },
    metaDescription: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate discount percentage
templateSchema.virtual("discountPercentage").get(function () {
  if (this.oldPrice && this.oldPrice > this.price) {
    return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }
  return this.discount || 0;
});

// Indexes for efficient queries
templateSchema.index({ slug: 1 });
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ isActive: 1, isFeatured: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ price: 1 });
templateSchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug if not provided
templateSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

const Template =
  mongoose.models.Template || mongoose.model("Template", templateSchema);

export default Template;

