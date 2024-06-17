let crypto = require('crypto');

let configPw = () => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        // Generate a new ACCESS_TOKEN_SECRET
        // Load the new ACCESS_TOKEN_SECRET into the environment variables
        process.env.ACCESS_TOKEN_SECRET = crypto.randomBytes(64).toString('hex');
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
        // Generate a new REFRESH_TOKEN_SECRET
        // Load the new REFRESH_TOKEN_SECRET into the environment variables
        process.env.REFRESH_TOKEN_SECRET = crypto.randomBytes(64).toString('hex');
    }

    if (!process.env.RESET_TOKEN_SECRET) {
        // Generate a new RESET_TOKEN_SECRET
        // Load the new RESET_TOKEN_SECRET into the environment variables
        process.env.RESET_TOKEN_SECRET = crypto.randomBytes(64).toString('hex');
    }

    if (!process.env.EMAIL_VERIFICATION_TOKEN_SECRET) {
        // Generate a new EMAIL_VERIFICATION_TOKEN_SECRET
        // Load the new EMAIL_VERIFICATION_TOKEN_SECRET into the environment variables
        process.env.EMAIL_VERIFICATION_TOKEN_SECRET = crypto.randomBytes(64).toString('hex');
    }

    // DEVICE_VERIFICATION_TOKEN_SECRET
    if (!process.env.DEVICE_VERIFICATION_TOKEN_SECRET) {
        // Generate a new DEVICE_VERIFICATION_TOKEN_SECRET
        // Load the new DEVICE_VERIFICATION_TOKEN_SECRET into the environment variables
        process.env.DEVICE_VERIFICATION_TOKEN_SECRET = crypto.randomBytes(64).toString('hex');
    }


}

module.exports = configPw;