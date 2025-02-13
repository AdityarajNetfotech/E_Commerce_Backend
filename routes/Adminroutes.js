// const express = require("express");
import express from "express";
import { registerAdmin, loginAdmin, getPendingSchools, approveSchool,logoutAdmin } from "../controllers/AdminAuth.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.put("/approve-school/:id", protectAdmin, approveSchool);// Only Admin can approve a school
router.get("/pending-schools", protectAdmin, getPendingSchools);
export default router;