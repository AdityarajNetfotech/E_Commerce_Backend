import { sendVerificationCode } from "../middleware/Email.js"
import Schoolmodel from "../models/School.js"
import Usermodel from "../models/User.js"
import bcryptjs from 'bcryptjs'
const register = async (req, res) => {
    try {
        const { email, password, name, mobileNumber, schoolId } = req.body;

        if (!email || !password || !name || !mobileNumber || !schoolId) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const ExistsUser = await Usermodel.findOne({ email });
        if (ExistsUser) {
            return res.status(400).json({ success: false, message: "User already exists please Login" });
        }

        const school = await Schoolmodel.findById(schoolId);
        if (!school) {
            return res.status(400).json({ success: false, message: "School not found" });
        }

        const hashedPassword = await bcryptjs.hashSync(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new Usermodel({
            email,
            password: hashedPassword,
            name,
            mobileNumber,
            verificationCode,
            school: schoolId
        });

        await user.save();
        sendVerificationCode(user.email, verificationCode);

        return res.status(200).json({ success: true, message: "User registered successfully", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
const VerifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        console.log("Received:", email, code); // ✅ Debugging

        const user = await Usermodel.findOne({ email, verificationCode: code });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or Expired Code" });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};
const resendOtp = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find user by email
      const user = await Usermodel.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }
  
      // Generate a new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      user.verificationCode = newOtp;
      await user.save();
  
      // Send new OTP to email (integrate your email service here)
      console.log(`New OTP for ${email}: ${newOtp}`);
  
      return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error resending OTP:", error);
      return res.status(500).json({ success: false, message: "Server error. Try again later." });
    }
  };
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Email not verified. Please verify your email first.' });
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        return res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
const logout = async (req, res) => {
    try {
       
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: true, 
            sameSite: 'strict', 
        });

        return res.status(200).json({ success: true, message: 'Logout successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
const getAllUsers = async (req, res) => {
    try {
        const users = await Usermodel.find({}, '-password -verificationCode'); // Exclude sensitive fields
        if (!users.length) {
            return res.status(404).json({ success: false, message: "No users found" });
        }
        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const deletedUser = await Usermodel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const updateUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Check if password is being updated and hash it
        if (updates.password) {
            updates.password = await bcryptjs.hash(updates.password, 10);
        }

        const updatedUser = await Usermodel.findByIdAndUpdate(userId, updates, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validations are applied
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User details updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Store the email in session or temporary storage
        req.session.email = email;

        // Check if the user exists
        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate a new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to the user
        user.verificationCode = otp;
        await user.save();

        // Send OTP via email (using the sendVerificationCode function)
        sendVerificationCode(user.email, otp);

        return res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Step 2: Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        // Check if email is stored in session
        const email = req.session.email;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await Usermodel.findOne({ email, verificationCode: otp });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Step 3: Reset Password
const resetPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;

        // Check if email is stored in session
        const email = req.session.email;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Email, new password, and confirm password are required' });
        }

        // Ensure new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        // Find the user by email
        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        user.verificationCode = undefined;  // Clear OTP once password is reset
        await user.save();

        // Clear the session email after resetting the password
        req.session.email = undefined;

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


export {register,VerifyEmail,login,logout,getAllUsers,deleteUser,updateUserDetails,resendOtp,forgetPassword,verifyOTP,resetPassword}