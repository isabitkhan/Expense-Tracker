import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     otp: { type: String },
//     otpExpiry: { type: Date },
//     isVerified: { type: Boolean, default: false },
//     refreshToken: {
//       type: String,
//     },
//     resetPasswordToken: { type: String },
//     resetPasswordExpiry: { type: Date },
//   },
//   { timestamps: true }
// );

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // password is required only if not using Google
      },
    },
    googleId: {
      type: String, // <-- for storing Google ID
      default: null,
    },
    name: {
      type: String,
    },
    avatar: {
      type: String, // for profile image URL from Google
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    is_Subscribed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next(); // check if passowrd is modified or not if modified then it will hash the password.
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// method use for checking password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
  this.refreshToken = refreshToken;
  return refreshToken;
};
export const User = mongoose.model("User", userSchema);
