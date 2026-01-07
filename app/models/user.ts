// models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: [],
    },
  ],
  // Purchased templates
  purchasedTemplates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: [],
    },
  ],
  // Optional: You can also store address references in user
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      default: [],
    },
  ],
  // User preferences
  preferences: {
    newsletter: {
      type: Boolean,
      default: false,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for purchased templates lookup
userSchema.index({ email: 1 });
userSchema.index({ purchasedTemplates: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
