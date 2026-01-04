import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    shippingFee: {
      type: Number,
      required: false,
      default: 0,
      min: [0, "Shipping fee cannot be negative"],
    },
    cairoGizaShippingFee: {
      type: Number,
      required: false,
      default: 0,
      min: [0, "Cairo/Giza shipping fee cannot be negative"],
    },
    otherCitiesShippingFee: {
      type: Number,
      required: false,
      default: 0,
      min: [0, "Other cities shipping fee cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.index({ _id: 1 }, { unique: true });

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;
