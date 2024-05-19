let express = require('express');
let router = express.Router();

let bookController = require('../controllers/book.controller');
let auth = require('../middlewares/auth.middleware');
let {upload, imageFilterMiddleware} = require('../middlewares/multer.middleware');

router.route('/')
    .get(bookController.findAll)  // GET /api/v2/books - Retrieve all Books from the database (Public)
    .post(auth.adminMiddleware, upload.single('cover'), imageFilterMiddleware, bookController.create); // POST /api/v2/books - Create a new Book (Admin)

router.route('/:bookId')
    .get(bookController.findOne) // GET /api/v2/books/:bookId - Retrieve a single Book with id (Public)
    .put(auth.adminMiddleware, bookController.update) // PUT /api/v2/books/:bookId - Update a Book with id (Admin)
    .delete(auth.adminMiddleware, bookController.delete); // DELETE /api/v2/books/:bookId - Delete a Book with id (Admin)


router.route('/:bookId/reviews')
    .get(bookController.findAllReviews) // GET /api/v2/books/:bookId/reviews - Retrieve all Reviews of a Book with id (Public)
    .post(auth.authMiddleware, bookController.addReview); // POST /api/v2/books/:bookId/reviews - Add a Review to a Book with id (User)

router.route('/:bookId/reviews/:reviewId') // DELETE /api/v2/books/:bookId/reviews/:reviewId - Delete a Review with id (User)
    .delete(auth.authMiddleware, bookController.deleteReview); // DELETE /api/v2/books/:bookId/reviews/:reviewId - Delete a Review with id (User)

router.route('reviews/:reviewId')
    .delete(auth.adminMiddleware, bookController.deleteReview); // DELETE /api/v2/books/reviews/:reviewId - Delete a Review with id (Admin)

module.exports = router;