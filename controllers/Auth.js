import { sendVerificationCode } from "../middleware/Email.js"
import Usermodel from "../models/User.js"
import bcryptjs from 'bcryptjs'
const register=async(req,res)=>{
    try{
        const {email,password,name,mobileNumber}=req.body
        if(!email||!password||!name||!mobileNumber){
            return res.status(400).json({success:false,message:'All fields are req'})
        }
        const ExistsUser= await Usermodel.findOne({email})
        if(ExistsUser){
            return res.status(400).json({success:false, message:"User already exists please Login"})
        }
        const hasePassword = await bcryptjs.hashSync(password,10)
        const verificationCode=Math.floor(100000+Math.random()*900000).toString()
        const user= new Usermodel({
            email,password:hasePassword,name,mobileNumber,verificationCode
        })
        await user.save()
        sendVerificationCode(user.email,verificationCode)
        return res.status(200).json({success:true,message:"User register succesfully",user})
    }catch(error){
        console.log(error)
        return res.status(500).json({success:false,message:'Internal server error'})
    }
}

const VerifyEmail=async(req,res)=>{
    try{
        const {code}=req.body
        const user=await Usermodel.findOne({
            verificationCode:code
        })
        if(!user){
            return res.status(400).json({success:false,message:"Invalid or Expired Code"})
        }
        user.isVerified=true,
        user.verificationCode=undefined
        await user.save()
        return res.status(200).json({success:true,message:"Email verified succesfully"})
    }catch(error){

    }
}
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

export {register,VerifyEmail,login,logout,getAllUsers,deleteUser,updateUserDetails}