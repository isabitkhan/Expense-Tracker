import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";
import {
  sendOtpEmail,
  resendOtpEmail,
  sendSuccessVerificationEmail,
  sendResetPasswordEmail,
} from "../utils/email.js";

//tokens
const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

//generate opt
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User already registed");
  }
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    email,
    password,
    otp,
    otpExpiry,
  });

  await sendOtpEmail(user.email, otp);

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User registered Successfully.Please verify OTP sent to email."
      )
    );
});

//verify OTP

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(409, "User not registed");
  }
  if (user.isVerified) {
    throw new ApiError(400, "User already verified");
  }
  console.log(user.otp, otp);

  const storedOtp = user.otp?.toString().trim();
  const inputOtp = otp?.toString().trim();

  if (storedOtp !== inputOtp || user.otpExpiry < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // ✅ Send success email
  await sendSuccessVerificationEmail(user.email);

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        "Email verified successfully. A confirmation email has been sent."
      )
    );
});

//resend otp

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(409, "User not registed");
  }
  if (user.isVerified) {
    throw new ApiError(400, "User already verified");
  }
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await resendOtpEmail(user.email, otp);

  return res.status(201).json(new ApiResponse(200, "OTP resent Successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(password || email)) {
    throw new ApiError(400, "Email or Password is required.");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist.");
  }
  if (!user.isVerified) {
    throw new ApiError(400, "User is not verified First verified the User.");
  }
  if (!user.password) {
    throw new ApiError(
      400,
      "This account was registered using Google. Please login with Google."
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials.");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Please provide email");
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + 10 * 60 * 1000;

  user.resetPasswordToken = token;
  user.resetPasswordExpiry = expiry;
  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendResetPasswordEmail(user.email, resetLink);

  res.status(200).json(new ApiResponse(200, {}, "Reset link sent to email"));
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired reset token");

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");
  res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});
export {
  registerUser,
  verifyOtp,
  resendOtp,
  getAllUsers,
  loginUser,
  changeCurrentPassword,
  logoutUser,
  forgotPassword,
  resetPassword,
};
