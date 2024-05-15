let Book = require('../models/book.model');
let Category = require('../models/category.model');
let Review = require('../models/review.model');

/**
 * Book(title, author, description, cover, publication_date, publisher, quantity, language, isbn, average_rating,
 * total_ratings, reviews, categories)
 */


/**
 * User Functions
 * Find all books
 * GET /api/v2/books
 * Access: Public
 */
exports.findAll = (req, res) => {
    let query = req.query;
    let condition = {};

    if (query.title) {
        condition.title = {$regex: new RegExp(query.title), $options: "i"};
    }
    if (query.author) {
        condition.author = {$regex: new RegExp(query.author), $options: "i"};
    }
    if (query.publisher) {
        condition.publisher = {$regex: new RegExp(query.publisher), $options: "i"};
    }
    if (query.language) {
        condition.language = {$regex: new RegExp(query.language), $options: "i"};
    }
    if (query.genre) {
        // Books with genre that contains any of the genre in the query
        condition.genre = {$in: query.genre.split(',')};
    }
    if (query.tags) {
        // Books with tags that contains any of the tags in the query
        condition.tags = {$in: query.tags.split(',')};
    }
    Book.find(condition, null, null)
        .skip(parseInt(query.skip) || 0)
        .limit(parseInt(query.limit) || 10)
        .sort({title: 1})
        .select('title author cover publication_date publisher quantity language isbn genre tags average_rating total_ratings')
        .then(books => {
            res.status(200).json(books);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "Some error occurred while retrieving books."
            });
        });
};


/**
 * Create and save a new book
 * POST /api/v2/books
 * Access: Private, Admin only
 * Request: title, author, description, cover, publication_date, publisher, quantity, language, isbn, categories
 * Response: Book object || error message
 */
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.title) {
        return res.status(400).json({
            message: "Book title can not be empty"
        });
    }

    // Get categories from the database if they exist get their ids and add them to the book object before saving else
    // create them
    let book_data = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        cover: req.file ? req.file.path : 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.imdb.com%2Ftitle%2Ftt11206172%2F&psig=AOvVaw2lztlDB21LAbkrjhDZDMUS&ust=1714803217679000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCOjqhPjp8IUDFQAAAAAdAAAAABAE',
        publication_date: req.body.publication_date,
        publisher: req.body.publisher,
        quantity: req.body.quantity,
        language: req.body.language,
        isbn: req.body.isbn,
        categories: [],
    }

    if (req.body.categories) {
        try {
            let categoriesData = await Category.find({name: {$in: req.body.categories}}, null, null)

            book_data.categories = categoriesData.map(category => category._id);

            let newCategories = req.body.categories.filter(category => !categoriesData.map(c => c.name).includes(category));

            if (newCategories.length > 0) {
                let createdCategories = await Category.insertMany(newCategories.map(name => ({name})), null);

                book_data.categories.push(...createdCategories.map(category => category._id));
            }
        } catch (err) {
            return res.status(500).json({
                message: err.message || "Some error occurred while creating the Book."
            });
        }
    }

    // Create a Book
    const book = new Book(book_data);

    // Save Book in the database
    try {
        const savedBook = await book.save();
        res.status(201).json(savedBook);
    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while creating the Book."
        });
    }
}


/**
 * Find a single book with a bookId \n
 * GET /api/v2/books/:bookId
 * Access: Public
 */
exports.findOne = (req, res) => {
    Book.findById(req.params.bookId, null, null)
        .populate('reviews')
        .then(book => {
            if (!book) {
                return res.status(404).json({
                    message: "Book not found with id " + req.params.bookId
                });
            }
            res.status(200).json(book);
        })
        .catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).json({
                    message: "Book not found with id " + req.params.bookId
                });
            }
            return res.status(500).json({
                message: "Error retrieving book with id " + req.params.bookId
            });
        });
};


/**
 * Update a book identified by the bookId in the request
 * PUT /api/v2/books/:bookId
 * Access: Private, Admin only
 * Request: title, author, description, cover, publication_date, publisher, quantity, language, isbn, categories
 * Response: Book object || error message
 */
exports.update = async (req, res) => {
    try {
        // Validate Request
        if (!req.body.title) {
            return res.status(400).json({
                message: "Book title can not be empty"
            });
        }

        // Build update object with fields from request body
        let update = {};
        if (req.body.title) update.title = req.body.title;
        if (req.body.author) update.author = req.body.author;
        if (req.body.description) update.description = req.body.description;
        if (req.file) update.cover = req.file.path;
        if (req.body.publication_date) update.publication_date = req.body.publication_date;
        if (req.body.publisher) update.publisher = req.body.publisher;
        if (req.body.quantity) update.quantity = req.body.quantity;
        if (req.body.language) update.language = req.body.language;
        if (req.body.isbn) update.isbn = req.body.isbn;

        // Process categories
        if (req.body.categories) {
            let categoryData = await Category.find({name: {$in: req.body.categories}}, null, null).exec();
            let categoryIds = categoryData.map(data => data._id);
            let newCategories = req.body.categories.filter(data => !categoryData.map(c => c.name).includes(data));

            if (newCategories.length > 0) {
                let createdCategories = await Category.insertMany(newCategories.map(name => ({name})), null);
                categoryIds.push(...createdCategories.map(category => category._id));
            }
            update.categories = categoryIds;
        }

        // Find and update the book
        let updatedBook = await Book.findByIdAndUpdate(req.params.bookId, update, null).exec();

        if (!updatedBook) {
            return res.status(404).json({
                message: "Book not found with id " + req.params.bookId
            });
        }

        res.status(200).json({
            message: "Book updated successfully!"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || "Some error occurred while updating the Book."
        });
    }
}


/**
 * Delete a book with the specified bookId in the request
 * DELETE /api/v2/books/:bookId
 * Access: Private, Admin only
 */
exports.delete = (req, res) => {
    // Find book and delete it
    Book.deleteOne({_id: req.params.bookId})
        .then(book => {
            if (!book) {
                return res.status(404).json({
                    message: "Book not found with id " + req.params.bookId
                });
            }
            res.status(200).json({message: "Book deleted successfully!"});
        })
        .catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).json({
                    message: "Book not found with id " + req.params.bookId
                });
            }
            return res.status(500).json({
                message: "Could not delete book with id " + req.params.bookId
            });
        })
}


/**
 * Add a review to a book
 * POST /api/v2/books/:bookId/reviews
 * Access: Private
 * Request: rating, review
 * Response: Book object || error message
 */
exports.addReview = (req, res) => {
    // Validate Request
    if (!req.body.rating) {
        return res.status(400).json({
            message: "Rating can not be empty"
        });
    }

    // Find book and update it with the request body
    let review = new Review({
        rating: req.body.rating,
        review: req.body.review,
        user_id: req.user._id,
        book_id: req.params.bookId,
        comment: req.body.comment
    });

    review.save()
        .then(review => {
            Book.findByIdAndUpdate(req.params.bookId, {
                $push: {reviews: review._id},
                $inc: {total_ratings: 1, sum_rating: review.rating}
            }, null)
                .then(book => {
                    if (!book) {
                        return res.status(404).json({
                            message: "Book not found with id " + req.params.bookId
                        });
                    }
                    res.status(200).json(review);
                })
                .catch(err => {
                    if (process.env.NODE_ENV === 'development')
                        console.log(err);
                    res.status(500).json('Error updating book with id ' + req.params.bookId);
                });
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "Some error occurred while adding review."
            });
        });
}


/**
 * Find all reviews for a book
 * GET /api/v2/books/:bookId/review
 * Access: Public
 */
exports.findAllReviews = (req, res) => {
    Review.find({book_id: req.params.bookId}, null, null)
        .then(reviews => {
            res.status(200).json(reviews);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "Some error occurred while retrieving reviews."
            });
        });
}


/**
 * Delete a review from a book
 * DELETE /api/v2/books/:bookId/review/:reviewId
 * Access: Private
 */
exports.deleteReview = (req, res) => {
    Review.findByIdAndDelete(req.params.reviewId, null)
        .then(review => {
            if (!review) {
                return res.status(404).json({
                    message: "Review not found with id " + req.params.reviewId
                });
            }
            if (review.user_id !== req.user._id) {
                return res.status(403).json({
                    message: "You are not authorized to delete this review"
                });
            }
            if (review.book_id !== req.params.bookId) {
                return res.status(403).json({
                    message: "This review does not belong to this book"
                });
            }
            Book.findByIdAndUpdate(req.params.bookId, {
                $pull: {reviews: review._id},
                $inc: {total_ratings: -1, sum_rating: -review.rating}
            }, null)
                .then(book => {
                    if (!book) {
                        return res.status(404).json({
                            message: "Book not found with id " + req.params.bookId
                        });
                    }
                    res.status(200).json({message: "Review deleted successfully!"});
                })
                .catch(err => {
                    if (process.env.NODE_ENV === 'development')
                        console.log(err);
                    res.status(500).json('Error updating book with id ' + req.params.bookId);
                });
        })
        .catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).json({
                    message: "Review not found with id " + req.params.reviewId
                });
            }
            return res.status(500).json({
                message: "Could not delete review with id " + req.params.reviewId
            });
        })

}


/**
 * Delete a review (admin only)
 * DELETE /api/v2/books/review/:reviewId
 * Access: Private, Admin only
 */
exports.deleteReview = (req, res) => {
    Review.findByIdAndDelete(req.params.reviewId, null)
        .then(review => {
            if (!review) {
                return res.status(404).json({
                    message: "Review not found with id " + req.params.reviewId
                });
            }
            Book.findByIdAndUpdate(review.book_id, {
                $pull: {reviews: review._id},
                $inc: {total_ratings: -1, average_rating: -review.rating / this.total_ratings}
            }, null)
                .then(book => {
                    if (!book) {
                        return res.status(404).json({
                            message: "Book not found with id " + review.book_id
                        });
                    }
                    res.status(200).json({message: "Review deleted successfully!"});
                })
                .catch(err => {
                    if (process.env.NODE_ENV === 'development')
                        console.log(err);
                    res.status(500).json('Error updating book with id ' + review.book_id);
                });
        })
        .catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).json({
                    message: "Review not found with id " + req.params.reviewId
                });
            }
            return res.status(500).json({
                message: "Could not delete review with id " + req.params.reviewId
            });
        })
}
