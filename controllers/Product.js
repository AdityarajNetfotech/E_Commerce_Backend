import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import cloudinary from "../libs/cloudinary.js";

// ✅ Add a new product (Only for logged-in Schools)
export const addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock } = req.body;
  const imageUrl = req.file ? req.file.path : null; // Get image URL from Cloudinary

  if (!name || !description || !price || stock < 0) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  const product = new Product({
    school: req.school._id, // Assign logged-in school as owner
    name,
    description,
    price,
    stock,
    image: imageUrl, // ✅ Store Cloudinary image URL
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// ✅ Get all products added by the logged-in school
export const getSchoolProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ school: req.school._id });
  res.json(products);
});

// ✅ Update Product
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.school.toString() !== req.school._id.toString()) {
    return res.status(401).json({ message: "Not authorized to update this product" });
  }

  // If a new image is uploaded, replace the old one
  if (req.file) {
    // Delete old image from Cloudinary
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // Extract Cloudinary public_id
      await cloudinary.uploader.destroy(`product-images/${publicId}`);
    }
    product.image = req.file.path; // Save new image URL
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.stock = stock || product.stock;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// ✅ Delete Product (Only by School that owns it)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.school.toString() !== req.school._id.toString()) {
    return res.status(401).json({ message: "Not authorized to delete this product" });
  }

  // Delete image from Cloudinary if exists
  if (product.image) {
    const publicId = product.image.split("/").pop().split(".")[0]; // Extract Cloudinary public_id
    await cloudinary.uploader.destroy(`product-images/${publicId}`);
  }

  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
});
