import { User } from "../models/user.models.js";

// File: controllers/auth.controller.js

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
export const googleCallbackHandler = async (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  res
    .cookie("accessToken", accessToken, { httpOnly: true, secure: false }) // For local dev, secure: false
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: false })
    .redirect(process.env.FRONTEND_URL || "http://localhost:5173"); // Adjust to your HTML/test page
};
