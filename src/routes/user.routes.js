import { Router } from "express";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  changeCurrentPassword,
  logoutUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/verify-otp").post(verifyOtp);
router.route("/recent-otp").post(resendOtp);
router.route("/login-user").post(loginUser);
router.route("/change-user-password").post(verifyJWT, changeCurrentPassword);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/").get(verifyJWT, getAllUsers);

router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

export default router;
