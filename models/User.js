import mongoose from "mongoose";

const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'Phone no is required'],
        trim: true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobileNumber: {
        type: Number,
        required: [true, 'Phone no is required'],
        trim: true,
    },
    password:{
        type:String,
        required:true,
    },
    isVerified:{
        type:Boolean,
        default: false
    },
    verificationCode:String
},{timestamps:true})

const Usermodel=mongoose.model("user",userSchema)

export default Usermodel                            