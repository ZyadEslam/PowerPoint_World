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
  // Optional: You can also store address references in user
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      default: [],
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
