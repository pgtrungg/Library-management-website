const jwtHelper = require('jsonwebtoken');

let signAccessToken = (payload) => {
    return new Promise((resolve, reject) => {

        // Encode encrypted payload with secret key
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            reject(new Error('No access token secret provided'));
        }
        const options = {
            // expires in 15 minutes
            expiresIn: '15m',
            issuer: 'localhost'
        };
        jwtHelper.sign({data: payload}, secret, options, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}

// Verify access token and return decrypted payload
let verifyAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            reject(new Error('No access token secret provided'));
        }
        jwtHelper.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded.data);
        });
    });
}

let signRefreshToken = (payload) => {
    return new Promise((resolve, reject) => {
        // Encode encrypted payload with secret key
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            reject(new Error('No refresh token secret provided'));
        }
        const options = {
            // expires in 7 days
            expiresIn: '7d',
            issuer: 'localhost'
        };
        jwtHelper.sign({data: payload}, secret, options, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}

// Verify refresh token and return decrypted payload
let verifyRefreshToken = (token) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            reject(new Error('No refresh token secret provided'));
        }
        jwtHelper.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded.data);
        });
    });
}

let signResetToken = (payload) => {
    return new Promise((resolve, reject) => {
        // Encode encrypted payload with secret key
        const secret = process.env.RESET_TOKEN_SECRET;
        if (!secret) {
            reject(new Error('No reset token secret provided'));
        }
        const options = {
            // expires in 10 minutes
            expiresIn: '10m',
            issuer: 'localhost'
        };
        jwtHelper.sign({data: payload}, secret, options, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}

let verifyResetToken = (token) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.RESET_TOKEN_SECRET;

        if (!secret) {
            return reject(new Error('No reset token secret provided'));
        }

        jwtHelper.verify(token, secret, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded.data);
        });
    });
};


let signEmailVerificationToken = (payload) => {
    return new Promise((resolve, reject) => {
        // Encode encrypted payload with secret key
        const secret = process.env.EMAIL_VERIFICATION_TOKEN_SECRET;
        if (!secret) {
            reject(new Error('No email verification token secret provided'));
        }
        const options = {
            // expires in 10m
            expiresIn: '10m',
            issuer: 'localhost'
        };
        jwtHelper.sign({data: payload}, secret, options, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}


let verifyEmailVerificationToken = (token) => {
    console.log("verifyEmailVerificationToken called" + token)
    return new Promise((resolve, reject) => {
        const secret = process.env.EMAIL_VERIFICATION_TOKEN_SECRET;
        
        if (!secret) {
            reject(new Error('No email verification token secret provided'));
        }
        jwtHelper.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded.data);
        });
    });
}


module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    signResetToken,
    verifyResetToken,
    signEmailVerificationToken,
    verifyEmailVerificationToken
}

