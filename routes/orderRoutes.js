import express from "express";
import {
  placeOrder,
  getStudentOrders,
  getSchoolOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
  getAllOrders,
  updatePaymentStatus,
  getSavedAddress,
  updateSavedAddress,
  cancelOrder,
} from "../controllers/orderController.js";
import { protectStudent, protectSchool, protectAdmin } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
// ✅ Admin routes
router.get("/all-orders", protectAdmin, getAllOrders);
 
// ✅ Student routes
router.post("/add-order", protectStudent, placeOrder);
router.get("/my-orders", protectStudent, getStudentOrders);
router.put("/cancel/:id", protectStudent, cancelOrder);


// Adress routes 
router.get("/address", protectStudent, getSavedAddress);
router.put("/address", protectStudent, updateSavedAddress);
 
 
// ✅ School routes
router.get("/school-orders", protectSchool, getSchoolOrders);
router.put("/:id/status", protectSchool, updateOrderStatus);
router.put("/update-payment/:id", updatePaymentStatus); 
 
router.get("/:id", protectStudent, getOrderById);
router.delete("/:id", protectAdmin, deleteOrder);
 
 
export default router;