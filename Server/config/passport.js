import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

export default function initPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const name = profile.displayName;
          const googleId = profile.id;

          // find existing user by googleId or email
          let user = await User.findOne({ $or: [{ googleId }, { email }] });

          if (!user) {
            // create new user
            user = await User.create({
              name,
              email,
              googleId,
              isAccountVerified: true,
              // password optional — can leave blank/null or set random
              password: Math.random().toString(36).slice(-8),
            });
          } else if (!user.googleId) {
            // if user exists by email (regular signup), attach googleId
            user.googleId = googleId;
            user.isAccountVerified = true;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // passport requires these even if not using sessions
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => done(null, id));
}