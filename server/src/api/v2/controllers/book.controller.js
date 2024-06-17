let Book = require('../models/book.model');
let Category = require('../models/category.model');
let Review = require('../models/review.model');
const fs = require("node:fs");
const uploadOnCloudinary = require('../helper/cloudinary.helper');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
// Create a new JSDOM instance
const window = new JSDOM('').window;

// Initialize DOMPurify with the JSDOM window
const DOMPurify = createDOMPurify(window);

let writeLog = require('../helper/log.helper');


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
            writeLog.info(`[${req.clientIp}] - [Books retrieved successfully!] - [200]`)
            return res.status(200).json(books);
        })
        .catch(err => {
            writeLog.error(`[${req.clientIp}] - [${err}] - [500]`)
            return res.status(500).json({
                message: "Some error occurred while retrieving books."
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
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book title is missing] - [400]`)
        return res.status(400).json({
            message: "Book title can not be empty"
        });
    }

    // upload cover image
    if (!req.file) {
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book cover image is missing] - [400]`)
        return res.status(400).json({
            message: "Book cover image is required"
        });
    }

    // Get categories from the database if they exist get their ids and add them to the book object before saving else
    let arrCheck = [req.body.title, req.body.author, req.body.description, req.body.publication_date, req.body.publisher, req.body.quantity, req.body.language, req.body.isbn];
    if (arrCheck.includes(undefined)) {
        fs.unlinkSync(req.file.path);
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book data is missing] - [400]`)
        return res.status(400).json({
            message: "Book data is missing"
        });
    }
    // DOMPurify check for XSS
    for (let ntc in arrCheck) {
        let cleanText = DOMPurify.sanitize(ntc);
        if (cleanText !== ntc) {
            fs.unlinkSync(req.file.path);
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Invalid data] - [201]`)
            return res.status(201).json({
                message: "Invalid data"
            });
        }
    }
    for (let ntc in req.body.categories) {
        let cleanText = DOMPurify.sanitize(ntc);
        if (cleanText !== ntc) {
            fs.unlinkSync(req.file.path);
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Invalid data] - [201]`)
            return res.status(201).json({
                message: "Invalid data"
            });
        }
    }
    // create them
    let book_data = {
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        publication_date: req.body.publication_date,
        publisher: req.body.publisher,
        quantity: req.body.quantity,
        language: req.body.language,
        isbn: req.body.isbn,
        categories_name: req.body.categories ,
        categories: [],
    }

    if (req.body.categories) {
        try {
            const categoriesArray = Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories];
            let categoriesData = await Category.find({ name: { $in: categoriesArray } }, null, null);
            book_data.categories = categoriesData.map(category => category._id);
            let existingCategoryNames = categoriesData.map(category => category.name);
            let newCategories = categoriesArray.filter(category => !existingCategoryNames.includes(category));

            if (newCategories.length > 0) {
                let createdCategories = await Category.insertMany(newCategories.map(name => ({ name })));
                book_data.categories.push(...createdCategories.map(category => category._id));
            }
        } catch (err) {
            fs.unlinkSync(req.file.path);
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [${error}] - [500]`)
            return res.status(500).json({
                message: "Some error occurred while creating the Book."
            });
        }
    }



    // Save Book in the database
    try {
        // Upload cover image to cloudinary
        let cover = await uploadOnCloudinary(req.file.path);
        if (!cover) {
            // delete uploaded image
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Error uploading cover image] - [500]`)
            return res.status(500).json({
                message: "Some error occurred while creating the Book."
            });
        }
        book_data.cover = cover.url;


        // Create a Book
        const book = new Book(book_data);
        const savedBook = await book.save();
        return res.status(201).json(savedBook);
    } catch (err) {
        // delete uploaded image
        fs.unlinkSync(req.file.path);
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [${error}] - [500]`)
        return res.status(500).json({
            message: "Some error occurred while creating the Book."
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
                writeLog.info(`[${req.clientIp}] - [Book not found with id ${req.params.bookId}] - [404]`)
                return res.status(404).json({
                    message: "Book not found with id " + req.params.bookId
                });
            }
            return res.status(200).json(book);
        })
        .catch(err => {
            if (err.kind === 'ObjectId') {
                writeLog.error(`[${req.clientIp}] - [Error retrieving book with id ${req.params.bookId}] - [500]`)
                return res.status(404).json({
                    message: "Book not found with id " + req.params.bookId
                });
            }
            writeLog.error(`[${req.clientIp}] - [Error retrieving book with id ${req.params.bookId}] - [500]`)
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
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book title is missing] - [400]`)
            return res.status(400).json({
                message: "Book title can not be empty"
            });
        }

        let arrCheck = [req.body.title, req.body.author, req.body.description, req.body.publication_date, req.body.publisher, req.body.quantity, req.body.language, req.body.isbn];
        for (let ntc in arrCheck) {
            if (arrCheck[ntc] === undefined) {
                writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book data is missing] - [400]`)
                return res.status(400).json({
                    message: "Book data is missing"
                });
            }
            let cleanText = DOMPurify.sanitize(ntc);
            if (cleanText !== ntc) {
                writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Invalid data] - [201]`)
                return res.status(201).json({
                    message: "Invalid data"
                });
            }
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
            for (let ntc in req.body.categories) {
                let cleanText = DOMPurify.sanitize(ntc);
                if (cleanText !== ntc) {
                    writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Invalid data] - [201]`)
                    return res.status(201).json({
                        message: "Invalid data"
                    });
                }
            }
            try {
                update.categories_name = req.body.categories;
                // Ensure categoriesArray is always an array
                const categoriesArray = Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories];

                // Find categories matching the names in categoriesArray
                let categoryData = await Category.find({name: {$in: categoriesArray}}, null, null);

                // Get category IDs
                let categoryIds = categoryData.map(data => data._id);

                // Filter out new categories not present in the database
                let newCategories = categoriesArray.filter(data => !categoryData.map(c => c.name).includes(data));

                // If new categories are found, insert them into the database and update categoryIds
                if (newCategories.length > 0) {
                    let createdCategories = await Category.insertMany(newCategories.map(name => ({name})));
                    categoryIds.push(...createdCategories.map(category => category._id));
                }

                // Update the categories field in the update object
                update.categories = categoryIds;
            } catch (err) {
                // Handle error
                writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [${error}] - [500]`)
                return res.status(500).json({
                    message: "Some error occurred while processing categories."
                });
            }
        }
        // Find and update the book
        let updatedBook = await Book.findByIdAndUpdate(req.params.bookId, update, null).exec();

        if (!updatedBook) {
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book not found with id ${req.params.bookId}] - [404]`)
            return res.status(404).json({
                message: "Book not found with id " + req.params.bookId
            });
        }
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book updated successfully!] - [200]`)
        return res.status(200).json({
            message: "Book updated successfully!"
        });
    } catch (err) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [${error}] - [500]`)
        return res.status(500).json({
            message: "Some error occurred while updating the Book."
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
                writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book not found with id ${req.params.bookId}] - [404]`)
                return res.status(404).json({
                    message: "Book not found with id " + req.params.bookId
                });
            }
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book deleted successfully!] - [200]`)
            return res.status(200).json({message: "Book deleted successfully!"});
        })
        .catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book not found with id ${req.params.bookId}] - [404]`)
                return res.status(404).json({
                    message: "Book not found with id " + req.params.bookId
                });
            }
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Could not delete book with id ${req.params.bookId}] - [500]`)
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
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Rating is missing] - [400]`)
        return res.status(400).json({
            message: "Rating can not be empty"
        });
    }
    let cleanText = DOMPurify.sanitize(req.body.text);
    // console.log(cleanText)
    if (cleanText !== req.body.text) {
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Invalid comment] - [201]`)
        return res.status(201).json({
            message: "Invalid comment"
        });
    }

    // Find book and update it with the request body
    let review = new Review({
        rating: req.body.rating,
        user_id: req.user._id,
        book_id: req.params.bookId,
        comment: cleanText,
        username: req.user.username
    });

    review.save()
        .then(review => {
            Book.findByIdAndUpdate(req.params.bookId, {
                $push: {reviews: review._id},
                $inc: {total_ratings: 1, sum_rating: review.rating}
            }, null)
                .then(book => {
                    if (!book) {
                        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Book not found with id ${req.params.bookId}] - [404]`)
                        return res.status(404).json({
                            message: "Book not found with id " + req.params.bookId
                        });
                    }
                    writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Review added successfully!] - [200]`)
                    return res.status(200).json(review);
                })
                .catch(err => {
                    writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [Error updating book with id ${req.params.bookId}] - [500] - [${err}]`)
                    return res.status(500).json('Error updating book with id ' + req.params.bookId);
                });
        })
        .catch(err => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${req.user.role}] - [${err}] - [500]`)
            return res.status(500).json({
                message:  "Some error occurred while adding review."
            });
        });
}


/**
 * Find all reviews for a book
 * GET /api/v2/books/:bookId/review
 * Access: Public
 */
exports.findAllReviews = (req, res) => {
    Review.find({book_id: {"$eq": req.params.bookId}}, null, null)
        .then(reviews => {
            writeLog.info(`[${req.clientIp}] - [Reviews retrieved successfully!] - [200]`)
            return res.status(200).json(reviews);
        })
        .catch(err => {
            writeLog.error(`[${req.clientIp}] - [${err}] - [500]`)
            return res.status(500).json({
                message: error || "Some error occurred while retrieving reviews."
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
                writeLog.info(`[${req.clientIp}] - [Review not found with id ${req.params.reviewId}] - [404]`)
                return res.status(404).json({
                    message: "Review not found with id " + req.params.reviewId
                });
            }
            if (review.user_id !== req.user._id) {
                writeLog.info(`[${req.clientIp}] - [You are not authorized to delete this review] - [403]`)
                return res.status(403).json({
                    message: "You are not authorized to delete this review"
                });
            }
            if (review.book_id !== req.params.bookId) {
                writeLog.info(`[${req.clientIp}] - [This review does not belong to this book] - [403]`)
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
                        writeLog.info(`[${req.clientIp}] - [Book not found with id ${req.params.bookId}] - [404]`)
                        return res.status(404).json({
                            message: "Book not found with id " + req.params.bookId
                        });
                    }
                    writeLog.info(`[${req.clientIp}] - [Review deleted successfully!] - [200]`)
                    return res.status(200).json({message: "Review deleted successfully!"});
                })
                .catch(err => {
                    if (process.env.NODE_ENV === 'development')
                        console.log(err);
                    writeLog.error(`[${req.clientIp}] - [Error updating book with id ${req.params.bookId}] - [500]`)
                    return res.status(500).json('Error updating book with id ' + req.params.bookId);
                });
        })
        .catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                writeLog.info(`[${req.clientIp}] - [Review not found with id ${req.params.reviewId}] - [404]`)
                return res.status(404).json({
                    message: "Review not found with id " + req.params.reviewId
                });
            }
            writeLog.error(`[${req.clientIp}] - [Could not delete review with id ${req.params.reviewId}] - [500]`)
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
                writeLog.info(`[${req.clientIp}] - [Review not found with id ${req.params.reviewId}] - [404]`)
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
                        writeLog.info(`[${req.clientIp}] - [Book not found with id ${review.book_id}] - [404]`)
                        return res.status(404).json({
                            message: "Book not found with id " + review.book_id
                        });
                    }
                    writeLog.info(`[${req.clientIp}] - [Review deleted successfully!] - [200]`)
                    return res.status(200).json({message: "Review deleted successfully!"});
                })
                .catch(err => {
                    if (process.env.NODE_ENV === 'development')
                        console.log(err);
                    res.status(500).json('Error updating book with id ' + review.book_id);
                });
        })
        .catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                writeLog.info(`[${req.clientIp}] - [Review not found with id ${req.params.reviewId}] - [404]`)
                return res.status(404).json({
                    message: "Review not found with id " + req.params.reviewId
                });
            }
            writeLog.error(`[${req.clientIp}] - [Could not delete review with id ${req.params.reviewId}] - [500]`)
            return res.status(500).json({
                message: "Could not delete review with id " + req.params.reviewId
            });
        })
}
