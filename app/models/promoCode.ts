import mongoose, { Document, Model } from "mongoose";
import { PromoCodeState } from "@/app/types/types";

// Interface for PromoCode document
export interface IPromoCode extends Document {
  code: string;
  state: PromoCodeState;
  discountPercentage: number;
  author: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isValid(): boolean;
}

// Interface for PromoCode model with static methods
export interface IPromoCodeModel extends Model<IPromoCode> {
  updateExpiredCodes(): Promise<void>;
}

const promoCodeSchema = new mongoose.Schema<IPromoCode, IPromoCodeModel>({
  code: {
    type: String,
    required: [true, "Code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  state: {
    type: String,
    enum: Object.values(PromoCodeState),
    default: PromoCodeState.INACTIVE,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: [true, "Discount Percentage is required"],
    min: 0,
    max: 100,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Admin ID is required"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ state: 1 });
promoCodeSchema.index({ endDate: 1 });

// Method to check if promo code is currently valid
promoCodeSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.state === PromoCodeState.ACTIVE &&
    this.startDate <= now &&
    this.endDate >= now
  );
};

// Static method to update expired promo codes
promoCodeSchema.statics.updateExpiredCodes = async function () {
  const now = new Date();
  await this.updateMany(
    {
      state: PromoCodeState.ACTIVE,
      endDate: { $lt: now },
    },
    {
      $set: { state: PromoCodeState.EXPIRED },
    }
  );
};

// Pre-save middleware to update updatedAt
promoCodeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const PromoCode: IPromoCodeModel =
  (mongoose.models.PromoCode as IPromoCodeModel) ||
  mongoose.model<IPromoCode, IPromoCodeModel>("PromoCode", promoCodeSchema);
export default PromoCode;
