import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if(!token) {
        return res.status(400).json({ success: false, message: 'Not Authorized, Please login again!' });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if(!decode.id) {
            return res.status(400).json({ success: false, message: 'Not authorized login again!'})
        }

        decode.id = req.body.userId;
        // if(decode.id) {
        //     req.body.userId = decode.id 
        // } else {
        //     return res.status(400).json({ success: false, message: 'Not authorized login again!'})
        // }
        next()
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}