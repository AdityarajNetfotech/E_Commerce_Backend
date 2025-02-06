import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema({
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
        unique: true,
        trim: true,
    },
    Address: {
        type: String,
        required: [true, 'Address is required'],
    },
    affiliationNumber: {
        type: Number
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Schoolmodel = mongoose.model("school", SchoolSchema);

export default Schoolmodel;