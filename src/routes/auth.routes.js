import express from "express";
import passport from "passport";
import { googleCallbackHandler } from "../controllers/auth.controller.js";

const router = express.Router();

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallbackHandler
);

export default router;
