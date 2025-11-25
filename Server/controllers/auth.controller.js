import userModel from "../models/userModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from "../config/nodemailer.js"

export const register = async (req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password) {
        return res.json({success: false, message: 'All fields required'})
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new userModel({ name, email, password: hashedPassword})
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'nonde' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Apex Innovation',
            text: `Welcome to Apex Innovation website. Your account has been created with email id: ${email}`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'User registered successfully!'})
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.json({ success: false, message: 'Email and password are required'})
    }

    try {
        const user = await userModel.findOne({ email })

        if(!user) {
            return res.status(401).json({ success: false, message: 'Invalid email'})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password'})
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, message: 'User login successfully!'})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })

        return res.status(200).json({ success: true, message: 'User logout successfully!'})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message})
    }
}

// Send verification OTP to the user's Email
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified) {
            return res.status({ success: false, message: 'Account already verified' })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        };

        await transporter.sendMail(mailOption);
        
        return res.status(200).json({ success: true, message: 'Verification OTP sent on Email'})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// verify email using otp
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if(!userId || !otp) {
        return res.status(400).json({ success: false, message: 'Missing Details!'})
    }

    try {
        const user = await userModel.findById(userId);

        if(!user) {
            return res.status(400).json({ success: false, message: 'User not found!' })
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP'})
        }

        if(user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP Expired!' })
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.status(200).json({ success: true, message: 'Email verified successfully!'})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// check user loggedin or not
export const isAuthenticated = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId)

        return res.status(200).json({ success: true, message: `Welcome ${user.name}!` })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// send passwordReset OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if(!email) {
        return res.status(400).json({ success: false, message: 'Email is required!' })
    }

    try {
        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ success: false, message: 'User not found!' })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`
        }
        await transporter.sendMail(mailOption);

        return res.status(200).json({ success: true, message: 'OTP sent to your email!' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Reset user password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if(!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required! '})
    }

    try {
        const user = await userModel.findOne({ email });
        if(!user) {
            return register.status(400).status({ success: false, message: 'User not found!' })
        }

        if(user.resetOtp === "" || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP!' })
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.status(400).json({ success: false, message: 'OTP Expired'})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save()

        return res.status(200).json({ success: true, message: 'Password has been reset successfully!' })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}