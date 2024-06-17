let User = require('../models/user.model');
let cloudinary = require('../helper/cloudinary.helper');
const bcrypt = require("bcrypt");
const fs = require("node:fs");

let writeLog = require('../helper/log.helper');

let {isEmail, isStrongPassword, isDate, isMobilePhone} = require('validator');

const createDOMPurify = require('dompurify');
const {JSDOM} = require("jsdom");
const axios = require("axios");
// Create a new JSDOM instance
const window = new JSDOM('').window;

// Initialize DOMPurify with the JSDOM window
const DOMPurify = createDOMPurify(window);


// User Functions Controllers

// Get user profile controller
// GET /api/v2/user/:userId
// Request body: {}
// Response body: { username, email, name, phone, address, role, join_date, status, avatar, date_of_birth, gender }\
exports.getProfile = async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Forbidden] - [403]`);
        return res.status(403).json({message: 'Forbidden'});
    }
    try {
        let user = await User.findById(req.user._id, null, null)
            .select('username name email name phone address role join_date status avatar date_of_birth gender');

        if (!user) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [User not found] - [404]`);
            return res.status(404).json({message: 'User not found'});
        }
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Get user profile] - [200]`);
        return res.status(200).json(user);
    } catch (error) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500]`);
        return res.status(500).json({message: 'Internal server error'});
    }
}

// Update user profile controller
// PUT /api/v2/user/
// Request body: { username, email, name, phone, address, date_of_birth, gender}
exports.updateProfile = async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Forbidden] - [403]`);
        return res.status(403).json({message: 'Forbidden'});
    }
    let update = {};
    if (req.body.username) {
        let clean = DOMPurify.sanitize(req.body.username);
        if (clean !== req.body.username) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid username] - [400]`);
            return res.status(400).json({message: 'Invalid username'});
        }
        update.username = clean;
    }
    if (req.body.email) {
        if (!isEmail(req.body.email)) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid email] - [400]`);
            return res.status(400).json({message: 'Invalid email'});
        }
        update.email = req.body.email;
    }
    if (req.body.name) {
        let clean = DOMPurify.sanitize(req.body.name);
        if (clean !== req.body.name) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid name] - [400]`);
            return res.status(400).json({message: 'Invalid name'});
        }
        update.name = req.body.name;
    }
    if (req.body.phone) {
        if (!isMobilePhone(req.body.phone, 'any')) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid phone] - [400]`);
            return res.status(400).json({message: 'Invalid phone'});
        }
        update.phone = req.body.phone;
    }
    if (req.body.address) {
        let clean = DOMPurify.sanitize(req.body.address);
        if (clean !== req.body.address) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid address] - [400]`);
            return res.status(400).json({message: 'Invalid address'});
        }
        update.address = req.body.address;
    }
    if (req.body.date_of_birth) {
        if (!isDate(req.body.date_of_birth)) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid date of birth] - [400]`);
            return res.status(400).json({message: 'Invalid date of birth'});
        }
        update.date_of_birth = req.body.date_of_birth;
    }
    if (req.body.gender) {
        // gender in ['male', 'female', 'other']
        if (['male', 'female', 'other'].indexOf(req.body.gender) === -1) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid gender] - [400]`);
            return res.status(400).json({message: 'Invalid gender'});
        }
        update.gender = req.body.gender
    }

    User.findByIdAndUpdate(
        req.user._id,
        update,
        {new: true}
    ).select('username name email name phone address role join_date status avatar date_of_birth gender')
        .then((user) => {
            if (!user) {
                writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [User not found] - [404]`);
                return res.status(404).json({message: 'User not found'});
            }
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Update user profile] - [200]`);
            let userInfo = {
                username: user.username,
                email: user.email,
                name: user.name,
                phone: user.phone,
                address: user.address,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                date_of_birth: user.date_of_birth,
                gender: user.gender
            }
            return res.status(200).json(userInfo);
        })
        .catch((error) => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500] - [${error}]`);
            return res.status(500).json({message: 'Internal server error'});
        });
}

// Update user avatar controller
// PUT /api/v2/user/:userId/avatar
// Request body: { avatar }
exports.updateAvatar = async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Forbidden] - [403]`);
        return res.status(403).json({message: 'Forbidden'});
    }
    let location = req.file?.path;
    if (!location) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Missing required fields] - [400]`);
        return res.status(400).json({message: 'Missing required fields'});
    }
    try {
        let avatar = await cloudinary(location);
        if (!avatar.url) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500]`);
            return res.status(500).json({message: 'Internal server error'});
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {avatar: avatar.url},
            null
        )
        if (!user) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [User not found] - [404]`);
            return res.status(404).json({message: 'User not found'});
        }
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Update user avatar] - [200]`);
        return res.status(200).json(user.avatar);
    } catch (error) {
        fs.unlinkSync(location);
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500]`);
        return res.status(500).json({message: 'Internal server error'});
    }

}


// Change user password controller
// PUT /api/v2/user/:userId/password
// Request body: { current_password, new_password }
exports.changePassword = async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Forbidden] - [403]`);
        return res.status(403).json({message: 'Forbidden'});
    }
    if (!req.body.current_password || !req.body.new_password) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Missing required fields] - [400]`);
        return res.status(400).json({message: 'Missing required fields'});
    }
    if (!isStrongPassword(req.body.new_password)) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid new password] - [400]`);
        return res.status(400).json({message: 'Invalid new password (Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character)'});
    }
    try {
        let user = await User.findById(req.user._id, null, null);
        if (!user) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [User not found] - [404]`);
            return res.status(404).json({message: 'User not found'});
        }
        let isMatch = await bcrypt.compare(req.body.current_password, user.password);
        if (!isMatch) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid current password] - [400]`);
            return res.status(400).json({message: 'Invalid current password'});
        }
        for (let old_password of user.oldPasswords) {
            isMatch = await bcrypt.compare(req.body.new_password, old_password);
            if (isMatch) {
                writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Password already used] - [400]`);
                return res.status(400).json({message: 'Password already used'});
            }
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.new_password, salt, async (err, hash) => {
                if (err) {
                    writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500]`);
                    return res.status(500).json({message: err.message});
                }
                await User.findByIdAndUpdate(
                    user._id,
                    {
                        password: hash,
                        old_passwords: [...user.oldPasswords, user.password]
                    },
                    null
                );
                writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Password changed successfully] - [200]`);
                return res.status(200).json({message: 'Password changed successfully'});
            });
        });
    } catch (error) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500]`);
        return res.status(500).json({message: 'Internal server error'});
    }
}

// Delete user controller
// DELETE /api/v2/user/:userId
// Request body: {password }
exports.deleteUser = async (req, res) => {
    const { recaptcha } = req.body;
    if (recaptcha) {
        try {
            const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`);
            const { success } = response.data;
            if (!success) {
                return res.status(400).json({ message: 'reCAPTCHA verification failed' });
            }
        } catch (error) {
            console.error('reCAPTCHA verification error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        return res.status(400).json({ message: 'Missing reCAPTCHA' });
    }
    if (req.user._id.toString() !== req.params.userId) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Forbidden] - [403]`);
        return res.status(403).json({ message: 'Forbidden' });
    }
    if (!req.body.password) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Missing required fields] - [400]`);
        return res.status(400).json({ message: 'Missing required fields' });
    }
    let user = await User.findById(req.user._id, null, null);
    if (!user) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [User not found] - [404]`);
        return res.status(404).json({ message: 'User not found' });
    }
    let isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid password] - [400]`);
        return res.status(400).json({ message: 'Invalid password' });
    } else {
        User.findByIdAndDelete(req.params.userId, null)
        .then(() => {
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [User deleted successfully] - [200]`);
            return res.status(200).json({message: 'User deleted successfully'});
        })
        .catch((error) => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500] - [${error}]`);
            return res.status(500).json({message: 'Internal server error'});
        });
    }
}



// Admin Functions Controllers
// Get all users, get user by id, delete user, activate user, deactivate user, suspend user

// Get all users controller
// GET /api/v2/users/?username=&email=&full_name=&phone=&address=&gender=&role=&status=
exports.getAllUsers = async (req, res) => {
    let condition = {};
    if (req.query.role) {
        condition.role = {$in: req.query.role.split(',')};
    }
    if (req.query.status) {
        condition.status = {$in: req.query.status.split(',')};
    }
    if (req.query.username) {
        condition.username = {$regex: req.query.username, $options: 'i'};
    }
    if (req.query.email) {
        condition.email = {$regex: req.query.email, $options: 'i'};
    }
    if (req.query.name) {
        condition.name = {$regex: req.query.name, $options: 'i'};
    }
    if (req.query.phone) {
        condition.phone = {$regex: req.query.phone, $options: 'i'};
    }
    if (req.query.address) {
        condition.address = {$regex: req.query.address, $options: 'i'};
    }
    if (req.query.gender) {
        condition.gender = {$in: req.query.gender.split(',')};
    }

    User.find(condition, null, null)
        .select('-password -refreshToken -oldPasswords -__v -devices')
        .then((users) => {
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Get all users] - [200]`);
            return res.status(200).json(users);
        })
        .catch((error) => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500] - [${error}]`);
            return res.status(500).json({message: 'Internal server error'});
        });


}


// Get user by id controller
// GET /api/v2/users/admin/:userId
exports.getUserById = async (req, res) => {
    User.findById(req.params.userId, null, null)
        .select('-password -refreshToken')
        .then((user) => {
            if (!user) {
                writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [User not found] - [404]`);
                return res.status(404).json({message: 'User not found'});
            }
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Get user by id] - [200]`);
            return res.status(200).json(user);
        })
        .catch((error) => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500] - [${error}]`);
            return res.status(500).json({message: 'Internal server error'});
        });
}


// Delete user controller
// DELETE /api/v2/users/admin/:userId
exports.deleteUserByAdmin = async (req, res) => {
    const { recaptcha } = req.body;
    if (recaptcha) {
        try {
            const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`);
            const { success } = response.data;
            if (!success) {
                return res.status(400).json({ message: 'reCAPTCHA verification failed' });
            }
        } catch (error) {
            console.error('reCAPTCHA verification error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        return res.status(400).json({ message: 'Missing reCAPTCHA' });
    }
    User.findByIdAndDelete(req.params.userId, null)
        .then(() => {
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [User deleted successfully] - [200]`);
            return res.status(200).json({message: 'User deleted successfully'});
        })
        .catch((error) => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500] - [${error}]`);
            return res.status(500).json({message: 'Internal server error'});
        });
}


// Change user status controller
// PUT /api/v2/users/admin/:userId
// Request body: { status, role}
exports.changeStatus = async (req, res) => {
    // if missing both status and role
    if (!req.body.status && !req.body.role) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Missing required fields] - [400]`);
        return res.status(400).json({message: 'Missing required fields'});
    }
    const { recaptcha } = req.body;
    // Verify reCAPTCHA
    if (recaptcha) {
        try {
            const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`);
            const { success } = response.data;
            if (!success) {
                return res.status(400).json({ message: 'reCAPTCHA verification failed' });
            }
        } catch (error) {
            console.error('reCAPTCHA verification error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Missing reCAPTCHA] - [400]`);
        return res.status(400).json({ message: 'Missing reCAPTCHA' });
    }

    // if status is not in ['active', 'inactive', 'suspended']
    let updateInfo = {}
    if (req.body.status) {
        if (['active', 'inactive', 'suspended'].indexOf(req.body.status) === -1) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid status] - [400]`);
            return res.status(400).json({message: 'Invalid status'});
        }
        updateInfo.status = req.body.status;
    }
    // if role is not in ['user', 'admin']
    if (req.body.role) {
        if (['user', 'admin'].indexOf(req.body.role) === -1) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Invalid role] - [400]`);
            return res.status(400).json({message: 'Invalid role'});
        }
        updateInfo.role = req.body.role;
    }



    User.findByIdAndUpdate(
        req.params.userId,
        updateInfo,
        {new: true}
    )
        .then((user) => {
            if (!user) {
                writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [User not found] - [404]`);
                return res.status(404).json({message: 'User not found'});
            }
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Change user status] - [200]`);
            let userInfo = {
                username: user.username,
                email: user.email,
                name: user.name,
                phone: user.phone,
                address: user.address,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                date_of_birth: user.date_of_birth,
                gender: user.gender
            }
            return res.status(200).json(userInfo);
        })
        .catch((error) => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Internal server error] - [500] - [${error}]`);
            return res.status(500).json({message: 'Internal server error'});
        });

}


