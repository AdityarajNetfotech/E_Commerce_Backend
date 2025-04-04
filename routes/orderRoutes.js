import express from "express";
import {
  placeOrder,
  getStudentOrders,
  getSchoolOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
  getAllOrders,
} from "../controllers/orderController.js";
import { protectStudent, protectSchool, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin routes (Keep `all-orders` before `/:id`)
router.get("/all-orders", protectAdmin, getAllOrders);
router.delete("/:id", protectAdmin, deleteOrder);

// ✅ Student routes
router.post("/add-order", protectStudent, placeOrder);
router.get("/my-orders", protectStudent, getStudentOrders);
router.get("/:id", protectStudent, getOrderById); // Move this to the bottom

// ✅ School routes
router.get("/school-orders", protectSchool, getSchoolOrders);
router.put("/:id/status", protectSchool, updateOrderStatus);


export default router;
