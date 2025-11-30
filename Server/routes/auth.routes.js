import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from '../controllers/auth.controller.js';
import userAuth from '../middleware/userAuthMiddleware.js';
import passport from 'passport';
import jwt from 'jsonwebtoken'

const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp)
authRouter.post('/verify-account', userAuth, verifyEmail)
authRouter.get('/is-auth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendResetOtp)
authRouter.post('/reset-password', resetPassword)

// 1) Start Google OAuth flow
router.get(
    "/google",
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
      prompt: "select_account"
    })
  );

// 2) Callback
router.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err || !user) {
        console.error("Google OAuth failed:", err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth`);
      }
  
      // create JWT similar to your login
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
  
      // set cookie
      res.cookie("token", token, cookieOptions);
  
      // redirect to frontend. You can include a flag that indicates success.
      return res.redirect(`${process.env.CLIENT_URL}/?googleAuth=success`);
    })(req, res, next);
  });

export default authRouter;