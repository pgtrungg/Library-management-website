let fs = require('fs');
let crypto = require('crypto');

let configPw = () => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        // Generate a new ACCESS_TOKEN_SECRET
        const newSecret = crypto.randomBytes(64).toString('hex');

        // Append the new ACCESS_TOKEN_SECRET to the .env file
        fs.appendFileSync('.env', `\nACCESS_TOKEN_SECRET=${newSecret}`);

        // Load the new ACCESS_TOKEN_SECRET into the environment variables
        process.env.ACCESS_TOKEN_SECRET = newSecret;
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
        // Generate a new REFRESH_TOKEN_SECRET
        const newSecret = crypto.randomBytes(64).toString('hex');

        // Append the new REFRESH_TOKEN_SECRET to the .env file
        fs.appendFileSync('.env', `\nREFRESH_TOKEN_SECRET=${newSecret}`);

        // Load the new REFRESH_TOKEN_SECRET into the environment variables
        process.env.REFRESH_TOKEN_SECRET = newSecret;
    }

    if (!process.env.RESET_TOKEN_SECRET) {
        // Generate a new RESET_TOKEN_SECRET
        const newSecret = crypto.randomBytes(64).toString('hex');

        // Append the new RESET_TOKEN_SECRET to the .env file
        fs.appendFileSync('.env', `\nRESET_TOKEN_SECRET=${newSecret}`);

        // Load the new RESET_TOKEN_SECRET into the environment variables
        process.env.RESET_TOKEN_SECRET = newSecret;
    }

    if (!process.env.EMAIL_VERIFICATION_TOKEN_SECRET) {
        // Generate a new EMAIL_VERIFICATION_TOKEN_SECRET
        const newSecret = crypto.randomBytes(64).toString('hex');

        // Append the new EMAIL_VERIFICATION_TOKEN_SECRET to the .env file
        fs.appendFileSync('.env', `\nEMAIL_VERIFICATION_TOKEN_SECRET=${newSecret}`);

        // Load the new EMAIL_VERIFICATION_TOKEN_SECRET into the environment variables
        process.env.EMAIL_VERIFICATION_TOKEN_SECRET = newSecret;
    }

    if (!process.env.ENCRYPTION_KEY) {
        // Generate a new ENCRYPTION_KEY
        const newSecret = crypto.randomBytes(64).toString('hex');

        // Append the new ENCRYPTION_KEY to the .env file
        fs.appendFileSync('.env', `\nENCRYPTION_KEY=${newSecret}`);

        // Load the new ENCRYPTION_KEY into the environment variables
        process.env.ENCRYPTION_KEY = newSecret;
    }

    if (!process.env.SALT) {
        // Generate a new SALT
        const newSecret = crypto.randomBytes(64).toString('hex');

        // Append the new SALT to the .env file
        fs.appendFileSync('.env', `\nSALT=${newSecret}`);

        // Load the new SALT into the environment variables
        process.env.SALT = newSecret;
    }
}

module.exports = configPw;