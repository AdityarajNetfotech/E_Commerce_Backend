import asyncHandler from "express-async-handler";
import Admin from "../models/Admin.js";
import School from "../models/School.js";
import generateToken from "../utils/generateToken.js";
import {sendEmail} from "../utils/sendEmail.js";

// Register Admin
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400).json({ message: "Admin already exists" });
    return;
  }

  const admin = await Admin.create({ name, email, password });

  if (admin) {
    res.status(201).json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400).json({ message: "Invalid admin data" });
  }
});

// Login Admin
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Approve School
export const approveSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);
 
  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }
 
  if (school.isApproved) {
    return res.status(400).json({ message: "School is already approved" });
  }
 
  school.isApproved = true;
  await school.save();
 
  const subject = "School Approval Notification";
  const message = `Dear ${school.name},\n\nCongratulations! Your school has been approved successfully. You can now log in using your credentials.\n\nBest Regards,\nAdmin Team`;
 
  try {
    await sendEmail(school.email, subject, message);
    res.json({ message: "School approved successfully, and email sent", school });
  } catch (error) {
    res.status(500).json({ message: "School approved but failed to send email", error: error.message });
  }
 
 
 
});

export const disapproveSchool = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const school = await School.findById(req.params.id);
  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }
   if (!school.isApproved) 
    { return res.status(400).json({ message: "School is already disapproved" }); 
  } 
  school.isApproved = false; 
  school.disapprovalReason = reason || "No reason provided";
  await school.save(); 
  res.json({ message: "School disapproved successfully", school });
});

// Get Pending Schools
export const getPendingSchools = asyncHandler(async (req, res) => {
  const pendingSchools = await School.find({ isApproved: false }).select("-password");
  res.json(pendingSchools);
});

// Logout

export const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Expire the cookie immediately
  });

  res.json({ message: "Logged out successfully" });
});

