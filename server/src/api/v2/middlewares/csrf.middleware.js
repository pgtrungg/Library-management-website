let csrf = require('../helper/csrf.helper')
let writeLog = require('../helper/log.helper')


let csrfMiddleware = async (req, res, next) => {
    // Get CSRF token from request
    let csrfToken = req.headers['csrf-token']
    if (!csrfToken) {
        writeLog.error(`[${req.clientIp}] - [${req.originalUrl}] - [${req.method}] - [${req.protocol}] - No CSRF token provided.`)
        return res.status(401).json({
            success: false,
            message: 'No CSRF token provided.'
        });
    }

    try {
        // Verify CSRF token
        let check = await csrf.verifyCSRFToken(csrfToken);
        if (!check) {
            writeLog.error(`[${req.clientIp}] - [${req.originalUrl}] - [${req.method}] - [${req.protocol}] - Unauthorized`)
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        next();

    } catch (err) {
        if (err.message === 'jwt expired') {
            writeLog.error(`[${req.clientIp}] - [${req.originalUrl}] - [${req.method}] - [${req.protocol}] - Token expired`)
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        writeLog.error(`[${req.clientIp}] - [${req.originalUrl}] - [${req.method}] - [${req.protocol}] - Unauthorized`)
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
}


module.exports = csrfMiddleware
