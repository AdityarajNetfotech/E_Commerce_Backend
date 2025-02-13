import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School", // Reference to the School that owns the product
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 1, // Default stock is 1
    },
    image: {
      type: String, // Store Cloudinary image URL here
      required: false,
    },
  },
  {
    timestamps: true, // Automatically creates "createdAt" and "updatedAt"
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product; // Correct ES Module export
