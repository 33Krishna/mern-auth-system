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
        return res.json({
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

        return res.json({ success: true, message: 'User login successfully!'})
    } catch (error) {
        return res.json({ success: false, message: error.message })
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
        return res.json({ success: false, message: error.message})
    }
}

// 1.27.00