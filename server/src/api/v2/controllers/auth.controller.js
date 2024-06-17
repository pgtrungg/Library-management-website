let jwt = require('../helper/jwt.helper');
let bcrypt = require('bcrypt');
let {isEmail, isStrongPassword} = require('validator');
let sendEmail = require('../helper/email.helper');

//for CSRF token
let csrf = require('../helper/csrf.helper');

let User = require('../models/user.model');
let axios = require('axios');

let writeLog = require('../helper/log.helper');


// Support functions
// Generate access token and refresh token
const generateToken = async (user) => {
    let accessToken = await jwt.signAccessToken(user._id);
    let refreshToken = await jwt.signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.last_login = Date.now();
    user.save()

    return {accessToken, refreshToken};
}


// Login controller
// POST /api/v2/auth/login
// Request body: { email, password, remember }
// Response body: { message, username, _id, accessToken, refreshToken }
exports.login = async (req, res) => {
    const { email, password, remember, recaptcha } = req.body;

    // Verify email and password
    if (!email || !password) {
        writeLog.error(`[${req.clientIp}] Missing required fields`);
        return res.status(400).json({message: 'Missing required fields'});
    }
    User.findOne({email: email}, null, null)
        .then(async (user) => {
            if (!user) {
                writeLog.error(`[${req.clientIp}] ${email} not found`);
                return res.status(404).json({message: `Invalid credentials`});
            }
            if (user.falseLoginAttempts >= 3) {
                // Verify reCAPTCHA
                if (recaptcha) {
                    try {
                        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`);
                        const {success} = response.data;
                        if (!success) {
                            writeLog.error(`[${req.clientIp}] reCAPTCHA verification failed`);
                            return res.status(400).json({message: 'reCAPTCHA verification failed'});
                        }
                        writeLog.info(`[${req.clientIp}] reCAPTCHA verification successful`);
                    } catch (error) {
                        writeLog.error(`[${req.clientIp}] reCAPTCHA verification failed`);
                        return res.status(500).json({message: 'Internal server error'});
                    }
                }else {
                    writeLog.error(`[${req.clientIp}] reCAPTCHA verification is required`);
                    return res.status(400).json({message: 'reCAPTCHA verification is required', attempts: user.falseLoginAttempts});
                }
            }
            if (user.waits_until > Date.now()) {
                let message = 'Too many login attempts. Please wait for '+ Math.max(0, Math.ceil((user.waits_until-Date.now()) / 1000 / 60)) +' minutes';
                writeLog.error(`[${req.clientIp}] ${user.email} Too many login attempts. Try again later`);
                return res.status(428).json({message: message});
            }
            let isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                user.falseLoginAttempts += 1;
                if (user.falseLoginAttempts >= 5) {
                    user.waits_until = Date.now() + Math.pow(2, user.falseLoginAttempts - 5) * 1000 * 60; // 2^(attempts-5) minutes
                }
                await user.save();
                writeLog.error(`[${req.clientIp}] ${user.email} Invalid credentials`);
                return res.status(401).json({message: `Invalid credentials`, attempts: user.falseLoginAttempts});
            }
            if (user.status.toString() !== 'active') {
                writeLog.error(`[${req.clientIp}] ${user.email} is ${user.status}`);
                return res.status(403).json({message: `${user.email} is ${user.status}`});
            }
            let device = `${req.clientIp} - ${req.headers.userAgent}`;
            if (user.devices.indexOf(device) === -1) {
                // send email with verification link to verify new device
                let verificationToken = await jwt.signDeviceVerificationToken({_id: user._id, device: device});
                let verificationLink = `${process.env.BACKEND_URL}/api/v2/auth/verify-device/${verificationToken}`;
                let subject = 'Device Verification';
                let text = `Click on the link to verify new device: ${verificationLink}`;
                let html = `<p>Click <a href="${verificationLink}">here</a> to verify new device</p>`;
                sendEmail(user.email, subject, text, html).then()
                writeLog.info(`[${req.clientIp}] ${user.email} login from new device`);
                return res.status(401).json({message: 'Please check your email to verify new device'});
            }
            user.falseLoginAttempts = 0;

            await user.save();

            let tokens = await generateToken(user);

            //for CSRF token
            let csrfToken = await csrf.generateCSRFToken();

            let options = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            };
            if (remember) {
                options.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            }
            res.cookie('accessToken', tokens.accessToken, options);
            res.cookie('refreshToken', tokens.refreshToken, options);
            //for CSRF token
            options = {
                secure: process.env.NODE_ENV === 'production'
            }
            res.cookie('csrfToken', csrfToken, options);

            writeLog.info(`[${req.clientIp}] ${user.email} logged in`);
            return res.status(200).json({
                message: 'Login successful',
                username: user.username,
                _id: user._id,
                role: user.role,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        })
        .catch((error) => {
            writeLog.error(`[${req.clientIp}] ${error.message}`);
            return res.status(500).json({message: 'Internal server error'});
        });
}


// Register controller
// POST /api/v2/auth/register
// Request body: { username, password, email}
exports.register = async (req, res) => {
    let {username, password, email} = req.body;
    if (!username || !password || !email ) {
        writeLog.error(`[${req.clientIp}] Missing required fields`);
        return res.status(400).json({message: 'Missing required fields'});
    }
    if (!isEmail(email)) {
        writeLog.error(`[${req.clientIp}] Invalid email address`);
        return res.status(400).json({message: 'Invalid email address'});
    }
    if (!isStrongPassword(password)) {
        writeLog.error(`[${req.clientIp}] Password is too weak`);
        return res.status(400).json({message: 'Password is too weak'});
    }
    try {
        let user = await User.findOne({
            email: email
        }, null, null);
        if (user) {
            writeLog.error(`[${req.clientIp}] ${email} already exists`);
            return res.status(400).json({message: 'Email already exists'});
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    writeLog.error(`[${req.clientIp}] ${err.message}`);
                    return res.status(500).json({message: err.message});
                }
                let device = `${req.clientIp} - ${req.headers.userAgent}`;
                let newUser = new User({
                    username: username,
                    password: hash,
                    email: email,
                    devices: [device]
                });
                await newUser.save();
                // send email with verification link to activate account
                let verificationToken = await jwt.signEmailVerificationToken(newUser._id)
                let verificationLink = `${process.env.BACKEND_URL}/api/v2/auth/verify-email/${verificationToken}`;
                let subject = 'Account Verification';
                let text = `Click on the link to verify your account: ${verificationLink}`;
                let html = `<p>Click <a href="${verificationLink}">here</a> to verify your account</p>`;
                sendEmail(email, subject, text, html).then()
                writeLog.info(`[${req.clientIp}] ${email} registered`);
                return res.status(201).json({message: 'Please check your email to verify your account'});
            });
        });
    } catch (error) {
        writeLog.error(`[${req.clientIp}] ${error.message}`);
        return res.status(500).json({message: error.message});
    }
}


// Logout controller
// POST /api/v2/auth/logout
exports.logout = async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        null
    )
        .then(() => {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            //For CSRF token
            res.clearCookie('csrfToken');

            writeLog.info(`[${req.clientIp}] ${req.user.email} logged out`);
            return res.status(200).json({message: 'Logout successful'});

        })
        .catch((error) => {
            writeLog.error(`[${req.clientIp}] ${error.message}`);
            return res.status(500).json({message: 'Internal server error'});
        });
}

// Refresh token controller
// POST /api/v2/auth/refresh-token
exports.refreshToken = async (req, res) => {
    let refreshToken = req.cookies.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) {
        writeLog.error(`[${req.clientIp}] Refresh token is missing`);
        return res.status(400).json({message: 'Refresh token is required'});
    }
    try {
        let payload = await jwt.verifyRefreshToken(refreshToken);
        let user = await User.findById(payload, null, null);
        if (!user) {
            writeLog.error(`[${req.clientIp}] User not found in refresh token`);
            return res.status(404).json({message: 'User not found'});
        }
        if (user.refreshToken !== refreshToken) {
            writeLog.error(`[${req.clientIp}] Invalid refresh token`);
            return res.status(403).json({message: 'Invalid refresh token'});
        }
        let tokens = await generateToken(user);

        //for CSRF token
        let csrfToken = await csrf.generateCSRFToken();


        let options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };
        res.cookie('accessToken', tokens.accessToken, options);
        res.cookie('refreshToken', tokens.refreshToken, options);

        options = {
            secure: process.env.NODE_ENV === 'production'
        }
        res.cookie('csrfToken', csrfToken, options);
        writeLog.info(`[${req.clientIp}] Token refreshed`);
        return res.status(200).json({message: 'Token refreshed'});
    } catch (error) {
        // if error is cannot verify token, then it is invalid token error
        if (error.message === 'invalid signature') {
            // if invalid token, clear the cookie
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.clearCookie('csrfToken');
            writeLog.error(`[${req.clientIp}] Invalid token`);
            // redirect to login page
            return res.redirect(`${process.env.FRONTEND_URL}/login`);
        }
        writeLog.error(`[${req.clientIp}] ${error.message}`);
        return res.status(403).json({message: 'Forbidden'});
    }
}


// Reset password controller
// POST /api/v2/auth/forgot-password
// Request body: { email }
exports.forgotPassword = async (req, res) => {
    let {email} = req.body;
    if (!email) {
        writeLog.error(`[${req.clientIp}] Email is required`);
        return res.status(400).json({message: 'Email is required'});
    }
    if (!isEmail(email)) {
        writeLog.error(`[${req.clientIp}] Invalid email address`);
        return res.status(400).json({message: 'Invalid email address'});
    }
    try {
        let user = await User.findOne({
            email: email
        }, null, null);
        if (!user) {
            writeLog.error(`[${req.clientIp}] ${email} not found`);
            return res.status(200).json({message: 'Reset link sent to your email'});
        }
        // send email with reset link
        let resetToken = await jwt.signResetToken(user._id);

        // save reset token to user document
        user.resetPasswordToken = resetToken;
        await user.save();


        let resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        let subject = 'Reset Password';
        let text = `Click on the link to reset your password: ${resetLink}`;
        let html = `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`;
        sendEmail(email, subject, text, html).then()
        writeLog.info(`[${req.clientIp}] Reset link sent to ${email}`);
        return res.status(200).json({message: 'Reset link sent to your email'});
    } catch (error) {
        writeLog.error(`[${req.clientIp}] ${error.message}`);
        return res.status(500).json({message: 'Internal server error'});
    }
}


// Reset password controller
// PATCH /api/v2/auth/reset-password/:token
// Request body: { password }
exports.resetPassword = async (req, res) => {
    let {password} = req.body;
    if (!password) {
        writeLog.error(`[${req.clientIp}] Password is required`);
        return res.status(400).json({message: 'Password is required'});
    }
    if (!isStrongPassword(password)) {
        writeLog.error(`[${req.clientIp}] Password is too weak`);
        return res.status(400).json({message: 'Password is too weak'});
    }
    try {
        let payload = await jwt.verifyResetToken(req.params.token);
        let user = await User.findById(payload, null, null);
        if (!user) {
            writeLog.error(`[${req.clientIp}] User not found in reset password`);
            return res.status(404).json({message: 'User not found'});
        }

        if (user.resetPasswordToken !== req.params.token) {
            writeLog.error(`[${req.clientIp}] Invalid reset token`);
            return res.status(403).json({message: 'Invalid reset token'});
        }

        for (let old_password of user.oldPasswords) {
            let isMatch = await bcrypt.compare(password, old_password);
            if (isMatch) {
                writeLog.error(`[${req.clientIp}] Password already used`);
                return res.status(400).json({message: 'Password already used'});
            }
        }

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    writeLog.error(`[${req.clientIp}] ${err.message}`);
                    return res.status(500).json({message: err.message});
                }
                await User.findByIdAndUpdate(
                    user._id,
                    {
                        password: hash,
                        $unset: {
                            resetPasswordToken: 1 // this removes the field from document
                        },
                        oldPasswords: [...user.oldPasswords, user.password]
                    },
                    null
                );
                writeLog.info(`[${req.clientIp}] Password reset successful`);
                return res.status(200).json({message: 'Password reset successful'});
            });
        });
    } catch (error) {
        writeLog.error(`[${req.clientIp}] ${error.message}`);
        return res.status(403).json({message: 'Forbidden'});
    }
}

// Verify email controller
// PATCH /api/v2/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
    try {
        let payload = await jwt.verifyEmailVerificationToken(req.params.token);
        let user = await User.findByIdAndUpdate(
            payload,
            {status: 'active'},
            null
        );
        if (!user) {
            let message = encodeURIComponent('User not found in verify email');
            writeLog.error(`[${req.clientIp}] User not found in verify email`);
            return res.redirect(`${process.env.FRONTEND_URL}/verify-result/failed/${message}`);
        }
        let message = encodeURIComponent('Email verified successfully');
        writeLog.info(`[${req.clientIp}] email verified`);
        return res.redirect(`${process.env.FRONTEND_URL}/verify-result/success/${message}`);
    }
    catch (error) {
        let message = encodeURIComponent('Email verification failed');
        writeLog.error(`[${req.clientIp}] ${error.message}`);
        return res.redirect(`${process.env.FRONTEND_URL}/verify-result/failed/${message}`);
    }
}

/// active account
exports.activateAccount = async (req, res) => {
    try {
        let user = await User.find({email: {$eq: req.body.email}}, null, null);
        if (!user) {
            writeLog.error(`[${req.clientIp}] User not found in activate account`);
            return res.status(404).json({message: 'User not found'});
        }
        // send email with verification link to activate account
        let verificationToken = await jwt.signEmailVerificationToken(user[0]._id)
        let verificationLink = `${process.env.BACKEND_URL}/api/v2/auth/verify-email/${verificationToken}`;
        let subject = 'Account Verification';
        let text = `Click on the link to verify your account: ${verificationLink}`;
        let html = `<p>Click <a href="${verificationLink}">here</a> to verify your account</p>`;
        sendEmail(req.body.email , subject, text, html).then()
        writeLog.info(`[${req.clientIp}] ${req.body.email} registered`);
        return res.status(201).json({message: 'Please check your email to verify your account'});


    } catch (error) {
        writeLog.error(`[${req.clientIp}] ${error.message}`);
        return res.status(500).json({message: 'Internal server error'});
    }
}

// Verify device controller
// PATCH /api/v2/auth/verify-device/:token
exports.verifyDevice = async (req, res) => {
    try {
        let payload = await jwt.verifyDeviceVerificationToken(req.params.token);
        let user = await User.findById(payload._id, null, null);
        if (!user) {
            let message = encodeURIComponent('User not found in verify device');
            writeLog.error(`[${req.clientIp}] User not found in verify device`);
            return res.redirect(`${process.env.FRONTEND_URL}/verify-result/failed/${message}`);
        }
        let device = payload.device;
        user.devices.push(device);
        await user.save();
        let message = encodeURIComponent('Device verified');
        writeLog.info(`[${req.clientIp}] Device verified`);
        return res.redirect(`${process.env.FRONTEND_URL}/verify-result/success/${message}`);
    }
    catch (error) {
        let message = encodeURIComponent('Device verification failed');
        writeLog.error(`[${req.clientIp}] ${error.message}`);
        return res.redirect(`${process.env.FRONTEND_URL}/verify-result/failed/${message}`);
    }
}

// check false login attempts
// exports.checkFalseLoginAttempts = async (req, res) => {
//     try {
//         const { email } = req.params;
//
//         let user = await User.findOne({ email: email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         console.log(user.falseLoginAttempts);
//         return res.status(200).json({ attempts: user.falseLoginAttempts });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// }
