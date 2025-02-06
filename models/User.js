import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobileNumber: {
        type: Number,
        required: [true, 'Phone no is required'],
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: String,
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'school'
    }
}, { timestamps: true });

const Usermodel = mongoose.model("user", userSchema);

export default Usermodel;