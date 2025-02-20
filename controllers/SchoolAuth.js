import asyncHandler from "express-async-handler";
import School from "../models/School.js";
import generateToken from "../utils/generateToken.js";
import cloudinary from "../libs/cloudinary.js";
import Product from "../models/Product.js";
import {sendEmail} from "../utils/sendEmail.js"

// ✅ Register School (No Token Generated Here)
export const registerSchool = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, address, affiliationNumber } = req.body;
  let affiliationCertificate = "";
 
  // Upload certificate if provided
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "school_certificates",
      });
      affiliationCertificate = result.secure_url;
    } catch (error) {
      console.error("Error uploading certificate:", error);
      return res.status(500).json({ message: "Failed to upload affiliation certificate", error: error.message });
    }
  }
 
  const schoolExists = await School.findOne({ email });
 
  if (schoolExists) {
    return res.status(400).json({ message: "School already registered" });
  }
 
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
    // Send registration email
    const subject = "School Registration Successful";
    const message = `Dear ${school.name},\n\nThank you for registering. Your request has been received, and we will notify you once the admin approves your account.\n\nBest Regards,\nAdmin Team`;
 
    try {
      await sendEmail(school.email, subject, message);
      res.status(201).json({ message: "Registration request sent to admin, confirmation email sent" });
    } catch (error) {
      console.error("Error sending email:", error); // Logs full error
      return res.status(500).json({ message: "School registered but failed to send email", error: error.message || error });
    }
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

export const logoutSchool = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Expire the cookie immediately
  });

  res.json({ message: "Logged out successfully" });
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


export const getAllSchools = asyncHandler(async (req, res) => {
  try {
    const schools = await School.find().select("-password"); // Exclude passwords for security
    res.json({
      message: "All registered schools fetched successfully",
      schools,
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ message: "Failed to fetch schools", error: error.message });
  }
});
