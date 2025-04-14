import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: {
    type: Number,
    required: [true, 'Phone no is required'],
    trim: true,
  },
  state: {type: String , required: true},
  address: { type: String, required: true },
  affiliationNumber: { type: String, required: true, unique: true },
  affiliationCertificate: { type: String }, // Optional field (Cloudinary URL)
  isApproved: { type: Boolean, default: false },

  otp: { type: String },
  otpExpires: { type: Date },

    // 🔹 Forgot Password OTP
    resetOtp: { type: String }, // Stores OTP for password reset
    resetOtpExpires: { type: Date }, // OTP expiration time for password reset

}, { timestamps: true });

// Hash password before saving
schoolSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
schoolSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const School = mongoose.model("School", schoolSchema);
export default School; // Correct ES Module export
