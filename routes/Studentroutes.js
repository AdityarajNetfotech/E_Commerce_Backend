import express from "express";
import { 
  registerStudent, 
  loginStudent, 
  verifyStudentOTP, 
  getStudentProducts, 
  resendOTP, 
  forgotPassword, 
  verifyForgotPasswordOTP, 
  resetPassword,
  logoutStudent,
  
} from "../controllers/Student.js";
import { protectStudent } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register a new student
router.post("/register", registerStudent);
router.post("/verify", verifyStudentOTP);
router.post("/resend-otp", resendOTP);

router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTP);

// ✅ Reset password
router.post("/reset-password", resetPassword);

// ✅ Student login
router.post("/login", loginStudent);
router.post("/logout", logoutStudent);

// ✅ Get products for the logged-in student (Only products from their school)
router.get("/products", protectStudent, getStudentProducts);

// 


export default router; // Correct ES Module export
