import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Not Authorized, Please login again!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            return res.status(400).json({ success: false, message: 'Not authorized, login again!' });
        }

        req.user = decoded.id;
        next();

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export default userAuth;
