const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true
    },
    publication_date: {
        type: Date,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        required: true
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    categories_name: {
        type: String
    },
    sum_rating: {
        type: Number,
        default: 0
    },
    total_ratings: {
        type: Number,
        default: 0
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);