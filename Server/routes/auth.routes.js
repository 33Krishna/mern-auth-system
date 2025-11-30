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

// Step-1: Redirect to Google Login
authRouter.get('/google', passport.authenticate('google', { scope:['profile', 'email']}))

authRouter.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
        try {
            const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.SECRET_KEY, { expiresIn: '7d'})
            
            res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`)
        } catch (error) {
            console.log('Google login error:', error)
            res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`)
        }
    }
)

authRouter.get('/me', userAuth, (req, res) => {
    res.json({ success: true, user: req.user})
})

export default authRouter;