// const express = require("express");
import express from "express";
import { registerAdmin, loginAdmin, getPendingSchools, approveSchool,disapproveSchool,logoutAdmin,getAllSchools,deleteSchool,getAllStudents,deleteStudent,getAllAdmins,deleteAdmin } from "../controllers/AdminAuth.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.put("/approve-school/:id", protectAdmin, approveSchool);// Only Admin can approve a school
router.put("/disapprove-school/:id", protectAdmin, disapproveSchool);// Only Admin can disapprove a school
router.get("/pending-schools", protectAdmin, getPendingSchools);
router.get("/getAllSchools", getAllSchools);
router.delete("/deleteSchool/:id", deleteSchool);
router.get("/getAllStudents", getAllStudents);
router.delete("/deleteStudent/:id", deleteStudent);
router.get("/getAllAdmins", getAllAdmins); // Only Admins can see other admins
router.delete("/deleteAdmin/:id", deleteAdmin); // Only Admins can delete an admin
export default router;