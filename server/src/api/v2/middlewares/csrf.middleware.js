let csrf = require('../helper/csrf.helper')
let User = require('../models/user.model')


let csrfMiddleware = async (req, res, next) => {
    // Get CSRF token from request
    let csrfToken = req.headers['csrf-token']
    if (!csrfToken) {
        return res.status(401).json({
            success: false,
            message: 'No CSRF token provided.'
        });
    }

    try {
        // Verify CSRF token
        let check = await csrf.verifyCSRFToken(csrfToken);
        if (!check) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        //req.user = user;

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
    csrfMiddleware
}