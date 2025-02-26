import asyncHandler from "express-async-handler";
import School from "../models/School.js";
import Student from "../models/Student.js";
import generateToken from "../utils/generateToken.js";
import cloudinary from "../libs/cloudinary.js";
import Product from "../models/Product.js";
import {sendOTP} from "../utils/sendEmail.js";
import { sendEmail } from "../utils/sendEmail.js"


// ✅ Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); 

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

// update school
export const updateSchool = asyncHandler(async (req, res) => {
  const schoolId = req.school._id; // Get logged-in school ID
  const { name, email, mobile, address, affiliationNumber } = req.body;
  let updatedCertificateUrl = null;

  try {
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Handle file upload if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "school_certificates",
        });
        updatedCertificateUrl = result.secure_url;
      } catch (error) {
        console.error("Error uploading certificate:", error);
        return res.status(500).json({ message: "Failed to upload affiliation certificate", error: error.message });
      }
    }

    // Update fields only if provided
    if (name) school.name = name;
    if (email) school.email = email;
    if (mobile) school.mobile = mobile;
    if (address) school.address = address;
    if (affiliationNumber) school.affiliationNumber = affiliationNumber;
    if (updatedCertificateUrl) school.affiliationCertificate = updatedCertificateUrl;

    await school.save();

    res.json({
      message: "School details updated successfully",
      school: {
        _id: school._id,
        name: school.name,
        email: school.email,
        mobile: school.mobile,
        address: school.address,
        affiliationNumber: school.affiliationNumber,
        affiliationCertificate: school.affiliationCertificate,
      },
    });
  } catch (error) {
    console.error("Error updating school details:", error);
    res.status(500).json({ message: "Failed to update school details", error: error.message });
  }
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

export const getStudentsBySchool = asyncHandler(async (req, res) => {
  try {
    const schoolId = req.school._id;

    // Find students belonging to this school
    const students = await Student.find({ school: schoolId }).select("-password");

    res.json({
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
});


export const deleteStudent = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const schoolId = req.school._id;
  const student = await Student.findOne({ _id: studentId, school: schoolId });
  if (!student) {
    return res.status(404).json({ message: "Student not found or not registered under this school" });
  }
  await student.deleteOne();
  res.json({ message: "Student deleted successfully" });
});


export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Find student by email
  const school = await School.findOne({ email });

  if (!school) {
    return res.status(400).json({ message: "School not found" });
  }

  // Generate OTP for password reset
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // Update student with OTP for password reset
  school.resetOtp = otp;
  school.resetOtpExpires = otpExpires;
  await school.save();

  // Send the OTP via email
  await sendOTP(email, otp);

  res.json({ message: "Password reset OTP sent to email. Please verify." });
});

export const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  // Find student by OTP and check if OTP is not expired
  const school = await School.findOne({
    resetOtp: otp,
    resetOtpExpires: { $gt: Date.now() }, // Ensures OTP is not expired
  });

  if (!school) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // Clear OTP after successful verification
  school.resetOtp = undefined;
  school.resetOtpExpires = undefined;
  await school.save();

  res.json({ message: "OTP verified successfully. You can now reset your password." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Find student by email
  const school = await School.findOne({ email });

  if (!school) {
    return res.status(400).json({ message: "School not found" });
  }

  // ✅ Directly assign new password (pre-save hook will hash it)
  school.password = newPassword;

  // Save updated student
  await school.save();

  res.json({ message: "Password reset successful. You can now log in with your new password." });
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Find student by email
  const school = await School.findOne({ email });

  if (!school) {
    return res.status(400).json({ message: "School not found" });
  }

  if (school.isVerified) {
    return res.status(400).json({ message: "Email already verified. Please login." });
  }

  // Generate a new OTP
  const newOTP = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // New OTP valid for 10 minutes

  // Update student with new OTP
  school.otp = newOTP;
  school.otpExpires = otpExpires;
  await school.save();

  // Send the new OTP via email
  await sendOTP(email, newOTP);

  res.json({ message: "New OTP sent to email. Please verify to complete registration." });
});