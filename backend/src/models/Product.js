import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, "Please provide product stock"],
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Please provide category"],
      index: true,
    },
    brand: {
      type: String,
      default: "Generic",
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // if using Cloudinary later
      },
    ],
    // For reviews & ratings
    reviews: [reviewSchema],
    numReviews: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0, // average rating
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // who created it (admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
