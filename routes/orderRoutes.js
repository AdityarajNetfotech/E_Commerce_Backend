import express from "express";
import {
  placeOrder,
  getStudentOrders,
  getSchoolOrders,
  updateOrderStatus,
  deleteOrder
} from "../controllers/orderController.js";
import { protectStudent, protectSchool, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Student routes
router.post("/add-order", protectStudent, placeOrder);
router.get("/my-orders", protectStudent, getStudentOrders);

// ✅ School routes
router.get("/school-orders", protectSchool, getSchoolOrders);
router.put("/:id/status", protectSchool, updateOrderStatus);

// ✅ Admin route
router.delete("/:id", protectAdmin, deleteOrder);

export default router;
