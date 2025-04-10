import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Others"]
    },
    number: {
      type: Number,
      required: true,
      unique: true
    },
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, default: 1 },
        selectedSize: {
          type: String,
          required: false
        },
        selectedColor: {
          type: String,
          required: false
        },
        selectedMaterial: {
          type: String,
          required: false
        },
        price: {
          type: Number,
          required: false
        },
        image: {
          type: String,
          required: false
        }
      }
    ],

   orders: [
    {
      orderItems: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
          name: String,
          quantity: Number,
          price: Number,
          image: [String],
          size: String,
          color: String,
        },
      ],
      school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
      address: {
        emailId: String,
        phoneNumber: String,
        addressLine1: String,
        addressLine2: String,
        pincode: String,
        town: String,
        city: String,
        state: String,
      },
      totalAmount: Number,
      paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending",
      },
      orderStatus: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],

    // 🔹 Email Verification OTP
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },

    // 🔹 Forgot Password OTP
    resetOtp: { type: String }, // Stores OTP for password reset
    resetOtpExpires: { type: Date }, // OTP expiration time for password reset
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare password method
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model("Student", studentSchema);
export default Student; // Correct ES Module export
