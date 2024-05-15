const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    borrow_date: {
        type: Date,
        required: true
    },
    return_date: {
        type: Date,
        required: true
    },
    actual_return_date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned'],
        default: 'borrowed'
    }
});

const Borrowing_DetailsSchema = new mongoose.Schema({
    borrowing_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrowing',
        required: true
    },
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    }
});

const Borrowing = mongoose.model('Borrowing', borrowingSchema);
const Borrowing_Details = mongoose.model('Borrowing_Details', Borrowing_DetailsSchema);

module.exports = {
    Borrowing,
    Borrowing_Details
}