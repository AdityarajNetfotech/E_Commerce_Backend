import asyncHandler from "express-async-handler";
import Student from "../models/Student.js";
import Product from "../models/Product.js";

// ✅ Add to Cart
export const addToCart = asyncHandler(async (req, res) => {
    const studentId = req.student._id;
    const { productId, quantity, selectedSize, selectedColor, selectedMaterial, price, image } = req.body;

    const student = await Student.findById(studentId);
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    const cartItem = student.cart.find(
        (item) => 
            item.product.toString() === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor &&
            item.selectedMaterial === selectedMaterial
    );

    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        student.cart.push({
            product: productId,
            quantity,
            selectedSize,
            selectedColor,
            selectedMaterial,
            price,
            image
        });
    }

    await student.save();
    res.json({ message: "Product added to cart", cart: student.cart });
});

// ✅ Get Cart Items
export const getCart = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id).populate("cart.product", "name price");
    res.json(student.cart);
});

// ✅ Update Cart Quantity
export const updateCartQuantity = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id);
    const { productId, quantity } = req.body;

    const cartItem = student.cart.find((item) => item.product.toString() === productId);
    if (cartItem) {
        cartItem.quantity = quantity;
    } else {
        return res.status(404).json({ message: "Product not found in cart" });
    }

    await student.save();
    res.json({ message: "Cart updated", cart: student.cart });
});

// ✅ Remove from Cart
export const removeFromCart = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id);
    const { productId } = req.body;

    student.cart = student.cart.filter((item) => item.product.toString() !== productId);
    await student.save();

    res.json({ message: "Product removed from cart", cart: student.cart });
});
