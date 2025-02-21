import asyncHandler from "express-async-handler";
import Student from "../models/Student.js";
import School from "../models/School.js";
import Product from "../models/Product.js";
import {sendOTP} from "../utils/sendEmail.js"; // ✅ Import sendOTP function
import generateToken from "../utils/generateToken.js";

// ✅ Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Step 1: Register a new student and send OTP
export const registerStudent = asyncHandler(async (req, res) => {
  const { name, email, password, schoolId } = req.body;

  if (!name || !email || !password || !schoolId) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  // Check if the school exists and is approved
  const school = await School.findOne({ _id: schoolId, isApproved: true });
  if (!school) {
    return res.status(400).json({ message: "Invalid school selection" });
  }

  // Check if student already exists
  const studentExists = await Student.findOne({ email });
  if (studentExists) {
    return res.status(400).json({ message: "Student already exists" });
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // Create student with OTP but NOT verified yet
  const student = await Student.create({
    name,
    email,
    password,
    school: schoolId,
    otp,
    otpExpires,
    isVerified: false,
  });

  // Send OTP to student's email
  await sendOTP(email, otp);

  res.status(201).json({ message: "OTP sent to email. Please verify to complete registration." });
});

// ✅ Verify Student OTP
export const verifyStudentOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  // Find student by OTP
  const student = await Student.findOne({ otp, isVerified: false });

  if (!student) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Check if OTP is expired
  if (student.otpExpires < Date.now()) {
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }

  // Mark student as verified
  student.isVerified = true;
  student.otp = undefined; // Remove OTP after verification
  student.otpExpires = undefined;
  await student.save();

  res.json({
    message: "Registration successful!",
    _id: student._id,
    name: student.name,
    email: student.email,
    school: student.school,
    token: generateToken(student._id, "student"),
  });
});

// ✅ Resend OTP
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Find student by email
  const student = await Student.findOne({ email });

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  if (student.isVerified) {
    return res.status(400).json({ message: "Email already verified. Please login." });
  }

  // Generate a new OTP
  const newOTP = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // New OTP valid for 10 minutes

  // Update student with new OTP
  student.otp = newOTP;
  student.otpExpires = otpExpires;
  await student.save();

  // Send the new OTP via email
  await sendOTP(email, newOTP);

  res.json({ message: "New OTP sent to email. Please verify to complete registration." });
});

// ✅ Step 3: Student Login (Only Verified Students)
export const loginStudent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email }).populate("school");

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  if (!student.isVerified) {
    return res.status(403).json({ message: "Email not verified. Please complete registration." });
  }

  if (student && (await student.matchPassword(password))) {
    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      school: student.school,
      token: generateToken(student._id, "student"),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// ✅ Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Find student by email
  const student = await Student.findOne({ email });

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  // Generate OTP for password reset
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // Update student with OTP for password reset
  student.resetOtp = otp;
  student.resetOtpExpires = otpExpires;
  await student.save();

  // Send the OTP via email
  await sendOTP(email, otp);

  res.json({ message: "Password reset OTP sent to email. Please verify." });
});

// ✅ Verify OTP for Password Reset
export const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  // Find student by OTP and check if OTP is not expired
  const student = await Student.findOne({
    resetOtp: otp,
    resetOtpExpires: { $gt: Date.now() }, // Ensures OTP is not expired
  });

  if (!student) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // Clear OTP after successful verification
  student.resetOtp = undefined;
  student.resetOtpExpires = undefined;
  await student.save();

  res.json({ message: "OTP verified successfully. You can now reset your password." });
});

// ✅ Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Find student by email
  const student = await Student.findOne({ email });

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  // ✅ Directly assign new password (pre-save hook will hash it)
  student.password = newPassword;

  // Save updated student
  await student.save();

  res.json({ message: "Password reset successful. You can now log in with your new password." });
});

// ✅ Get products for the logged-in student (Only from their school)
export const getStudentProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ school: req.student.school._id });
  res.json(products);
});

export const logoutStudent = asyncHandler(async (req, res) => {
  // Clear the token cookie by setting it to an empty value and expiring it immediately.
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Immediately expire the cookie
  });

  res.json({ message: "Student Logged out successfully" });
});



