import mongoose from "mongoose";

const heroSectionSchema = new mongoose.Schema(
  {
    heroBadge: {
      type: String,
      required: [true, "Hero badge is required"],
      trim: true,
    },
    largestSale: {
      type: String,
      required: [true, "Largest sale text is required"],
      trim: true,
    },
    useCode: {
      type: String,
      required: [true, "Use code text is required"],
      trim: true,
    },
    forDiscount: {
      type: String,
      required: [true, "Discount text is required"],
      trim: true,
    },
    promoCode: {
      type: String,
      required: [true, "Promo code is required"],
      trim: true,
      uppercase: true,
    },
    locale: {
      type: String,
      enum: ["en", "ar"],
      required: [true, "Locale is required"],
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document per locale
heroSectionSchema.index({ locale: 1 }, { unique: true });

const HeroSection =
  mongoose.models.HeroSection ||
  mongoose.model("HeroSection", heroSectionSchema);

export default HeroSection;
