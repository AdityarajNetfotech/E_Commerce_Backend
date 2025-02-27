import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import cloudinary from "../libs/cloudinary.js";

// ✅ Add a new product (Only for logged-in Schools)
export const addProduct = asyncHandler(async (req, res) => {
  const { name, description, productDetail, SKU, category } = req.body;

  if (!name || !description || !productDetail || !SKU || !category) {
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
    productDetail,
    SKU,
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

  // ✅ Handle multiple image updates
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    if (product.image.length > 0) {
      for (const imgUrl of product.image) {
        const publicId = imgUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`product-images/${publicId}`);
      }
    }
    product.image = req.files.map((file) => file.path);
  }

  // ✅ Update only provided fields
  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (category) product.category = category;

  // ✅ Update category-specific details (Ensure JSON parsing)
  if (category === "Uniform") {
    product.uniformDetails = uniformDetails ? JSON.parse(uniformDetails) : product.uniformDetails;
  } else if (category === "Books") {
    product.bookDetails = bookDetails ? JSON.parse(bookDetails) : product.bookDetails;
  } else if (category === "Stationary") {
    product.stationaryDetails = stationaryDetails ? JSON.parse(stationaryDetails) : product.stationaryDetails;
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

  // ✅ Delete images from Cloudinary if exist
  if (product.image.length > 0) {
    for (const imgUrl of product.image) {
      const publicId = imgUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`product-images/${publicId}`);
    }
  }

  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
});
