const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    review_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);
