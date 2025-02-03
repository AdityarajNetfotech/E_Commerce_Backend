import Schoolmodel from "../models/School.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

 const Schoolregister = async (req, res) => {
  try {
    const { email, password, name, mobileNumber, Address, affiliationNumber } = req.body;
    if (!email || !password || !name || !mobileNumber || !Address || !affiliationNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existsUser = await Schoolmodel.findOne({ email });
    if (existsUser) {
      return res.status(400).json({ success: false, message: "User already exists, please log in" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new Schoolmodel({
      email,
      password: hashedPassword,
      name,
      mobileNumber,
      Address,
      affiliationNumber
    });
    await user.save();
    user.password = undefined;
    return res.status(200).json({
      success: true,
      message: "School registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
const SchoolLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await Schoolmodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User does not exist' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    user.password = undefined; 

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      // token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
const SchoolLogout = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
const getAllSchools = async (req, res) => {
  try {
    const schools = await Schoolmodel.find(); // Fetching all school records from the database
    if (!schools || schools.length === 0) {
      return res.status(404).json({ success: false, message: 'No schools found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Schools fetched successfully',
      schools,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
const deleteSchool = async (req, res) => {
  try {
    const { schoolId } = req.params; // Assuming the school ID is passed in the request parameters

    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School ID is required' });
    }

    const school = await Schoolmodel.findByIdAndDelete(schoolId); // Find and delete the school by its ID

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'School deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
const updateSchoolDetails = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const updates = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID is required" });
    }

    // Check if password is being updated and hash it
    if (updates.password) {
      updates.password = await bcryptjs.hash(updates.password, 10);
    }

    const updatedSchool = await Schoolmodel.findByIdAndUpdate(schoolId, updates, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validations are applied
    });

    if (!updatedSchool) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    return res.status(200).json({
      success: true,
      message: "School details updated successfully",
      school: updatedSchool,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {Schoolregister,SchoolLogin,SchoolLogout,getAllSchools,deleteSchool,updateSchoolDetails}
