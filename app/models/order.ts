import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Order item must reference a product"],
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    size: {
      type: String,
      required: false,
      trim: true,
    },
    color: {
      type: String,
      required: false,
      trim: true,
    },
    sku: {
      type: String,
      required: false,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Order item quantity is required"],
      min: [1, "Order item quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Order item price is required"],
      min: [0, "Order item price cannot be negative"],
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for guest orders
  },
  date: {
    type: Date,
    default: Date.now,
  },
  products: {
    type: [orderItemSchema],
    default: [],
    validate: [
      {
        validator: (items: unknown[]) =>
          Array.isArray(items) && items.length > 0,
        message: "Order must include at least one product",
      },
    ],
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: false,
  },
  address: {
    name: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
  },
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
  },
  orderState: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    required: [true, "Order State is required"],
    default: "Pending",
  },
  promoCode: {
    type: String,
    required: false,
  },
  discountAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  discountPercentage: {
    type: Number,
    required: false,
  },
  paymentMethod: {
    type: String,
    enum: ["cash_on_delivery", "paymob"],
    default: "cash_on_delivery",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  paymobOrderId: {
    type: String,
    required: false,
  },
  paymobTransactionId: {
    type: String,
    required: false,
  },
  trackingNumber: {
    type: String,
    required: false,
  },
  estimatedDeliveryDate: {
    type: Date,
    required: false,
  },
  shippedDate: {
    type: Date,
    required: false,
  },
  deliveredDate: {
    type: Date,
    required: false,
  },
  shippingFee: {
    type: Number,
    required: false,
    default: 0,
    min: [0, "Shipping fee cannot be negative"],
  },
});

// Add validation to ensure either addressId or address is provided
orderSchema.pre("validate", function (next) {
  if (!this.addressId && !this.address) {
    return next(new Error("Either addressId or address is required"));
  }
  if (this.addressId && this.address) {
    return next(new Error("Cannot provide both addressId and address"));
  }
  if (
    this.address &&
    (!this.address.name ||
      !this.address.phone ||
      !this.address.address ||
      !this.address.city ||
      !this.address.state)
  ) {
    return next(
      new Error(
        "Address fields (name, phone, address, city, state) are required when providing address directly"
      )
    );
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
