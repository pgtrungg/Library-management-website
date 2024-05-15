let jwt = require('../helper/jwt.helper')
let User = require('../models/user.model')

let authMiddleware = async (req, res, next) => {
    // Get access token from request
    let accessToken = req.cookies.accessToken || req.headers['x-access-token'] || req.headers['authorization'];
    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: 'No token provided.'
        });
    }

    try {
        // Verify access token
        let payload = await jwt.verifyAccessToken(accessToken);
        let user = await User.findById(payload, null, null);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        req.user = user;

        next();

    } catch (err) {
        if (process.env.NODE_ENV === 'development')
            console.log(err);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
}


let adminMiddleware = async (req, res, next) => {
    // Get access token from request
    let accessToken = req.headers['x-access-token'] || req.headers['authorization'] || req.cookies.accessToken;
    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: 'Forbidden'
        });
    }

    // Verify access token
    try {
        let payload = await jwt.verifyAccessToken(accessToken);
        let user = await User.findById(payload, null, null);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        console.log(user)
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        next();
    } catch (err) {
        if (process.env.NODE_ENV === 'development')
            console.log(err);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });

    }
}

module.exports = {
    authMiddleware,
    adminMiddleware
}