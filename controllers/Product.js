import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import cloudinary from "../libs/cloudinary.js";

// ✅ Add a new product (Only for logged-in Schools)
export const addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  if (!name || !description || !price || stock < 0 || !category) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  // ✅ Parse JSON strings to objects (if applicable)
  let uniformDetails = req.body.uniformDetails ? JSON.parse(req.body.uniformDetails) : undefined;
  let bookDetails = req.body.bookDetails ? JSON.parse(req.body.bookDetails) : undefined;
  let stationaryDetails = req.body.stationaryDetails ? JSON.parse(req.body.stationaryDetails) : undefined;

  // ✅ Extract multiple image URLs from Cloudinary uploads
  const imageUrls = req.files ? req.files.map((file) => file.path) : [];

  // ✅ Initialize product data
  let productData = {
    school: req.school._id,
    name,
    description,
    price,
    stock,
    category,
    image: imageUrls,
  };

  // ✅ Assign details only when category matches
  if (category === "Uniform") {
    if (!uniformDetails) {
      return res.status(400).json({ message: "Uniform details are required for uniform category" });
    }
    productData.uniformDetails = uniformDetails;
  }

  if (category === "Books") {
    if (!bookDetails) {
      return res.status(400).json({ message: "Book details are required for books category" });
    }
    productData.bookDetails = bookDetails;
  }

  if (category === "Stationary") {
    if (!stationaryDetails) {
      return res.status(400).json({ message: "Stationary details are required for stationary category" });
    }
    productData.stationaryDetails = stationaryDetails;
  }

  // ✅ Create and save the product
  const product = new Product(productData);
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
  const { name, description, price, stock, category, uniformDetails, bookDetails, stationaryDetails } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.school.toString() !== req.school._id.toString()) {
    return res.status(401).json({ message: "Not authorized to update this product" });
  }

  // Handle image update
  if (req.file) {
    if (product.image.length > 0) {
      const publicId = product.image[0].split("/").pop().split(".")[0]; // Extract Cloudinary public_id
      await cloudinary.uploader.destroy(`product-images/${publicId}`);
    }
    product.image = [req.file.path]; // Save new image URL as an array
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.stock = stock || product.stock;
  product.category = category || product.category;

  // Update category-specific details
  if (category === "Uniform") {
    product.uniformDetails = uniformDetails || product.uniformDetails;
  } else if (category === "Books") {
    product.bookDetails = bookDetails || product.bookDetails;
  } else if (category === "Stationary") {
    product.stationaryDetails = stationaryDetails || product.stationaryDetails;
  }

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

  // Delete images from Cloudinary if exist
  if (product.image.length > 0) {
    const publicId = product.image[0].split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`product-images/${publicId}`);
  }

  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
});
