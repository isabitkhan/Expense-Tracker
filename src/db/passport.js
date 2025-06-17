import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.models.js";
import crypto from "crypto";

// Google strategy (you already have this part)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;

      try {
        let user = await User.findOne({ email });

        // CASE 1: User does not exist — create new
        if (!user) {
          const newUser = {
            email,
            password: crypto.randomBytes(16).toString("hex"),
            isVerified: true,
          };

          // only add googleId if profile.id exists
          if (profile.id) {
            newUser.googleId = profile.id;
          }

          user = await User.create(newUser);
        }

        // CASE 2: User exists but is from email/password
        else if (!user.googleId) {
          return done(
            new Error(
              "This email is already registered. Please log in using password."
            ),
            null
          );
        }

        // CASE 3: user exists & already linked with googleId
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
// ✅ Fix starts here — add these two lines
passport.serializeUser((user, done) => {
  done(null, user._id); // you can also do done(null, user) if storing whole user
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // this makes req.user = user
  } catch (err) {
    done(err, null);
  }
});
