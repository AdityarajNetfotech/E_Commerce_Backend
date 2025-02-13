import asyncHandler from "express-async-handler";
import School from "../models/School.js";
import generateToken from "../utils/generateToken.js";
import cloudinary from "../libs/cloudinary.js";
import Product from "../models/Product.js";

// ✅ Register School (No Token Generated Here)
export const registerSchool = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, address, affiliationNumber } = req.body;
  let affiliationCertificate = "";

  // Upload certificate if provided
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "school_certificates",
    });
    affiliationCertificate = result.secure_url;
  }

  // Check if the school is already registered
  const schoolExists = await School.findOne({ email });

  if (schoolExists) {
    return res.status(400).json({ message: "School already registered" });
  }

  // Create a new school
  const school = await School.create({
    name,
    email,
    password,
    mobile,
    address,
    affiliationNumber,
    affiliationCertificate, // Store Cloudinary URL
  });

  if (school) {
    res.status(201).json({ message: "Registration request sent to admin" });
  } else {
    res.status(400).json({ message: "Invalid school data" });
  }
});

// ✅ Login School (Token Generated Here)
export const loginSchool = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const school = await School.findOne({ email });

  if (!school) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await school.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!school.isApproved) {
    return res.status(403).json({ message: "School not approved by Admin" });
  }

  res.json({
    _id: school.id,
    name: school.name,
    email: school.email,
    mobile: school.mobile,
    address: school.address,
    affiliationNumber: school.affiliationNumber,
    affiliationCertificate: school.affiliationCertificate,
    isApproved: school.isApproved,
    token: generateToken(school._id, "school"),
  });
});

// ✅ Get School Dashboard
export const getSchoolDashboard = asyncHandler(async (req, res) => {
  const school = await School.findById(req.school._id).select("-password");

  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }

  // Fetch all products added by this school
  const products = await Product.find({ school: req.school._id });

  res.json({
    message: `Welcome to your dashboard, ${school.name}!`,
    schoolDetails: school,
    products, // ✅ Include school's products in the response
  });
});
