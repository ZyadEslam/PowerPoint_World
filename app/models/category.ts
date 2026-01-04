import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: [true, "Category slug is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
categorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
