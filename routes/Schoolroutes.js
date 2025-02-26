import express from "express";
import { registerSchool, loginSchool, getSchoolDashboard,logoutSchool,deleteStudent,getStudentsBySchool,forgotPassword,resendOTP,verifyForgotPasswordOTP, resetPassword, updateSchool  } from "../controllers/SchoolAuth.js";
import { protectSchool } from "../middleware/authMiddleware.js";
import { uploadAffiliationCertificate } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", uploadAffiliationCertificate.single("affiliationCertificate"), registerSchool);
router.post("/login", loginSchool);
router.post("/logout",protectSchool, logoutSchool);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTP);

router.put("/update", protectSchool,  updateSchool);
router.get("/students", protectSchool,getStudentsBySchool);
router.delete("/students/:id", protectSchool, deleteStudent);



// ✅ Example of a protected school route (only approved schools can access)
router.get("/dashboard", protectSchool, getSchoolDashboard);

export default router; // Correct ES Module export
