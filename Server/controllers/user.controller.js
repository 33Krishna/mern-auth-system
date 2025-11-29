import userModel from '../models/userModel.js'

export const getUserData = async (req, res) => {
    try {
        const userId = req.user;
        const user = await userModel.findById(userId);

        if(!user) {
            return res.status(400).json({ success: true, message: 'User not found!' })
        }

        return res.status(200).json({
            success: true, 
            message: 'Get userdata',
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        })
    } catch (error) {
        return res.status(500).json({ success: true, message: error.message })
    }
}