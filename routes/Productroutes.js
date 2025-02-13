import express from "express";
import { protectSchool } from "../middleware/authMiddleware.js";
import { addProduct, getSchoolProducts, updateProduct, deleteProduct } from "../controllers/Product.js";
import { uploadProductImage } from "../middleware/uploadMiddleware.js"; // Import upload middleware

const router = express.Router();

// ✅ School can add products with an image
router.post("/add", protectSchool, uploadProductImage.single("image"), addProduct);

// ✅ Get all products for the logged-in school
router.get("/my-products", protectSchool, getSchoolProducts);

// ✅ Update product with new image
router.put("/update/:id", protectSchool, uploadProductImage.single("image"), updateProduct);

// ✅ Delete product (Only by the school that owns it)
router.delete("/delete/:id", protectSchool, deleteProduct);

export default router; // Correct ES Module export
