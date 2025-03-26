import Admin from "../models/Admin.js";
import School from "../models/School.js";
import Student from "../models/Student.js"
import generateToken from "../utils/generateToken.js";

export const googleSignin = async (req, res) => {
    try {
        const { email } = req.body;
        let user = null;
        let role = "";

        user = await Student.findOne({ email });
        if (user) role = "Student";

        if (!user) {
            user = await School.findOne({ email });
            if (user) role = "School";
        }

        if (!user) {
            user = await Admin.findOne({ email });
            if (user) role = "Admin";
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = generateToken(user._id, role);

        res.status(200).json({
            message: "Login successful",
            _id: user._id,
            name: user.name,
            email: user.email,
            role,
            token,
        });

    } catch (error) {
        console.error('Error in Google Login:', error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
}


