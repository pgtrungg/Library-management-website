let User = require('../models/user.model');
let cloudinary = require('../helper/cloudinary.helper');
const bcrypt = require("bcrypt");
const fs = require("node:fs");


// User Functions Controllers

// Get user profile controller
// GET /api/v2/user/:userId
// Request body: { }
// Response body: { username, email, name, phone, address, role, join_date, status, avatar, date_of_birth, gender }\
exports.getProfile = async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
        return res.status(403).json({message: 'Forbidden'});
    }
    try {
        let user = await User.findById(req.user._id, null, null)
            .select('username name email name phone address role join_date status avatar date_of_birth gender');

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(200).json(user);
    } catch (error) {
        if (process.env.NODE_ENV === 'development')
            console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}

// Update user profile controller
// PUT /api/v2/user/:userId
// Request body: { username, email, name, phone, address, date_of_birth, gender}
exports.updateProfile = async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
        return res.status(403).json({message: 'Forbidden'});
    }
    let update = {};

    if (req.body.username) {
        update.username = req.body.username;
    }
    if (req.body.email) {
        update.email = req.body.email;
    }
    if (req.body.name) {
        update.name = req.body.name;
    }
    if (req.body.phone) {
        update.phone = req.body.phone;
    }
    if (req.body.address) {
        update.address = req.body.address;
    }
    if (req.body.date_of_birth) {
        update.date_of_birth = req.body.date_of_birth;
    }
    if (req.body.gender) {
        update.gender = req.body.gender
    }

    User.findByIdAndUpdate(
        req.user._id,
        update,
        {new: true}
    ).select('username name email name phone address role join_date status avatar date_of_birth gender')
        .then((user) => {
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            return res.status(200).json(user);
        })
        .catch((error) => {
            if (process.env.NODE_ENV === 'development')
                console.log(error);
            return res.status(500).json({message: 'Internal server error'});
        });
}

// Update user avatar controller
// PUT /api/v2/user/:userId/avatar
// Request body: { avatar }
exports.updateAvatar = async (req, res) => {
    if (!(req.user._id.toString() === req.params.userId)) {
        return res.status(403).json({message: 'Forbidden'});
    }
    let location = req.file?.path;
    if (!location) {
        return res.status(400).json({message: 'Missing required fields'});
    }
    try {
        let avatar = await cloudinary(location);
        if (!avatar.url) {
            return res.status(500).json({message: 'Internal server error'});
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {avatar: avatar.url},
            {new: true}
        )
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(200).json(user.avatar);
    } catch (error) {
        if (process.env.NODE_ENV === 'development')
            console.log(error);
        fs.unlinkSync(location);
        return res.status(500).json({message: 'Internal server error'});
    }

}


// Change user password controller
// PUT /api/v2/user/:userId/password
// Request body: { current_password, new_password }
exports.changePassword = async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
        return res.status(403).json({message: 'Forbidden'});
    }
    if (!req.body.current_password || !req.body.new_password) {
        return res.status(400).json({message: 'Missing required fields'});
    }
    try {
        let user = await User.findById(req.user._id, null, null);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        let isMatch = await bcrypt.compare(req.body.current_password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: 'Invalid current password'});
        }
        for (let old_password of user.oldPasswords) {
            isMatch = await bcrypt.compare(req.body.new_password, old_password);
            if (isMatch) {
                return res.status(400).json({message: 'Password already used'});
            }
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.new_password, salt, async (err, hash) => {
                if (err) {
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
                return res.status(200).json({message: 'Password changed successfully'});
            });
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development')
            console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}

// Delete user controller
// DELETE /api/v2/user/:userId
// Request body: {password }
exports.deleteUser = async (req, res) => {
    if (req.user._id.toString() !== req.params.userId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    if (!req.body.password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    let user = await User.findById(req.user._id, null, null);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    let isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
    } else {
        User.findByIdAndDelete(req.params.userId, null)
        .then(() => {
            return res.status(200).json({message: 'User deleted successfully'});
        })
        .catch((error) => {
            if (process.env.NODE_ENV === 'development')
                console.log(error);
            return res.status(500).json({message: 'Internal server error'});
        });
    }
}



// Admin Functions Controllers
// Get all users, get user by id, delete user, activate user, deactivate user, suspend user

// Get all users controller
// GET /api/v2/users/
exports.getAllUsers = async (req, res) => {
    console.log(req.query);
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
        .select('-password')
        .then((users) => {
            return res.status(200).json(users);
        })
        .catch((error) => {
            if (process.env.NODE_ENV === 'development')
                console.log(error);
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
                return res.status(404).json({message: 'User not found'});
            }
            return res.status(200).json(user);
        })
        .catch((error) => {
            if (process.env.NODE_ENV === 'development')
                console.log(error);
            return res.status(500).json({message: 'Internal server error'});
        });
}


// Delete user controller
// DELETE /api/v2/users/admin/:userId
exports.deleteUserByAdmin = async (req, res) => {
    User.findByIdAndDelete(req.params.userId, null)
        .then(() => {
            return res.status(200).json({message: 'User deleted successfully'});
        })
        .catch((error) => {
            if (process.env.NODE_ENV === 'development')
                console.log(error);
            return res.status(500).json({message: 'Internal server error'});
        });
}


// Change user status controller
// PUT /api/v2/users/admin/:userId
// Request body: { status }
exports.changeStatus = async (req, res) => {
    if (!req.body.status) {
        return res.status(400).json({message: 'Missing required fields'});
    }

    User.findByIdAndUpdate(
        req.params.userId,
        {status: req.body.status},
        {new: true}
    )
        .then((user) => {
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            return res.status(200).json(user);
        })
        .catch((error) => {
            if (process.env.NODE_ENV === 'development')
                console.log(error);
            return res.status(500).json({message: 'Internal server error'});
        });

}


