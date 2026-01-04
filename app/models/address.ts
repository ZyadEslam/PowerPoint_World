// models/address.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  name: {
    type: String,
    required: [true, "User name is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone Number is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  city: {
    type: String,
    required: [true, "City is Required"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

if (mongoose.models.Address) {
  mongoose.deleteModel("Address");
}

const Address = mongoose.model("Address", addressSchema);
export default Address;