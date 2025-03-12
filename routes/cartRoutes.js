import express from "express";
import { addToCart, getCart, updateCartQuantity, removeFromCart } from "../controllers/CartController.js";
import { protectStudent } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protectStudent, addToCart);
router.get("/", protectStudent, getCart);
router.put("/update", protectStudent, updateCartQuantity);
router.delete("/remove", protectStudent, removeFromCart);

export default router;
