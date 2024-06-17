let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
        required: true
    },
    join_date: {
        type: Date,
        default: Date.now
    },
    last_login: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'inactive'
    },
    avatar: {
        type: String,
        default: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Ffree-png-vectors%2Fdefault-avatar&psig=AOvVaw3z194Q0mFKMpCGz723upmZ&ust=1714787334011000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJDpgOKu8IUDFQAAAAAdAAAAABAE'
    },
    date_of_birth: {
        type: Date,
        required: false
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: false
    },
    refreshToken: {
        type: String,
        required: false
    },
    falseLoginAttempts: {
        type: Number,
        default: 0
    },
    waits_until: {
        type: Date,
        default: Date.now()
    },
    oldPasswords: {
        type: [String],
        default: []
    },
    devices: {
        type: [String],
        default: []
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);