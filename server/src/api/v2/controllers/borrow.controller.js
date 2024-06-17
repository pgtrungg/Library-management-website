let {Borrowing, Borrowing_Details} = require('../models/borrow.model');
let Book = require('../models/book.model');
let User = require('../models/user.model');

let writeLog = require('../helper/log.helper');

// User Functions

/**
 * Create and Save a new Borrowing
 * POST /api/v2/borrow
 * Request: {user_id, book_list: [{book_id, quantity}], days}
 */
exports.borrow = async (req, res) => {
    // Validate request
    if (!req.body.user_id || !req.body.book_list || !req.body.days) {
        writeLog.error('Content can not be empty!', req.body);
        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Content is empty!] - [400]`);
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    if (req.user._id.toString() !== req.body.user_id) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Forbidden!] - [401]`);
        return res.status(401).send({
            message: "Forbidden!"
        });
    }

    try {
        // Check if user exists
        let user = await User.findById(req.body.user_id, { __v: 0 }, null);
        if (!user) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [User not found!] - [404]`);
            return res.status(404).send({
                message: "User not found!"
            });
        }

        // Validate and fetch books
        let books = await Promise.all(req.body.book_list.map(async (bookItem) => {
            let book = await Book.findById(bookItem.book_id, { __v: 0 }, null);
            if (!book) {
                throw { status: 404, message: "Book not found!" };
            }
            if (book.quantity < bookItem.quantity) {
                throw { status: 400, message: "Not enough books in stock!" };
            }
            return { book, requestedQuantity: bookItem.quantity };
        }));

        // Create a Borrowing
        let borrowing = new Borrowing({
            user_id: req.body.user_id,
            borrow_date: new Date(),
            return_date: new Date(new Date().getTime() + req.body.days * 24 * 60 * 60 * 1000)
        });

        // Save Borrowing in the database
        let savedBorrowing = await borrowing.save();

        // Prepare and save borrowing details, update book quantities
        let borrowingDetails = books.map(({ book, requestedQuantity }) => {
            book.quantity -= requestedQuantity;
            book.save();
            return new Borrowing_Details({
                borrowing_id: savedBorrowing._id,
                book_id: book._id,
                quantity: requestedQuantity
            });
        });

        await Borrowing_Details.insertMany(borrowingDetails);

        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Borrowing created successfully.] - [200]`);
        return res.status(200).send(savedBorrowing);

    } catch (error) {
        if (error.status) {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [${error.message}] - [${error.status}]`);
            return res.status(error.status).send({ message: error.message });
        }
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Some error occurred while processing the request] - [500]`);
        return res.status(500).send({
            message: "Some error occurred while processing the request."
        });
    }
};



/**
 * Get own Borrowings
 * GET /api/v2/borrow
 */
exports.borrowings = (req, res) => {
    Borrowing.find({ user_id: req.user._id }, { __v: 0 }, null)
        .then(data => {
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Borrowings retrieved successfully.] - [200]`);
            res.status(200).send(data);
        })
        .catch(err => {
            if (process.env.NODE_ENV === 'development')
                console.log(err);
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Some error occurred while retrieving borrowings.] - [500]`);
            return res.status(500).send({
                message: "Some error occurred while retrieving borrowings."
            });
        });
}


/**
 * Return a Borrowing
 * PUT /api/v2/borrow/:id
 */
exports.return = async (req, res) => {
    let id = req.params.borrowId;

    // Find the borrowing record
    let borrowing = await Borrowing.findById(id, { __v: 0 }, null);
    if (!borrowing) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Borrowing not found!] - [404]`);
        return res.status(404).send({
            message: "Borrowing not found!"
        });
    }

    // Check if the user is authorized to return this borrowing
    if (req.user._id.toString() !== borrowing.user_id.toString()) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Forbidden!] - [401]`);
        return res.status(401).send({
            message: "Forbidden!"
        });
    }

    // Check if the borrowing is already returned
    if (borrowing.status === 'returned') {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Borrowing already returned!] - [400]`);
        return res.status(400).send({
            message: "Borrowing already returned!"
        });
    }

    // Update borrowing record
    borrowing.actual_return_date = new Date();
    borrowing.status = 'returned';

    try {
        await borrowing.save();

        // Find all borrowing details for this borrowing
        let borrowingDetails = await Borrowing_Details.find({ borrowing_id: {$eq: id} }, { __v: 0 }, null);

        let bookUpdates = borrowingDetails.map(async (detail) => {
            let book = await Book.findById(detail.book_id, { __v: 0 }, null);
            if (book) {
                book.quantity += detail.quantity; // Add the correct quantity back to the book stock
                return book.save();
            }
        });

        // Wait for all book updates to complete
        await Promise.all(bookUpdates);

        writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Borrowing returned successfully.] - [200]`);
        return res.status(200).send(borrowingDetails);
    } catch (err) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Some error occurred while returning the Borrowing.] - [500]`);
        return res.status(500).send({
            message: err.message || "Some error occurred while returning the Borrowing."
        });
    }
};



/**
 * Get borrowing details
 * GET /api/v2/borrow/:id
 */
exports.details = async (req, res) => {
    let id = req.params.id;

    let borrowing = await Borrowing.findById(id, { __v: 0 }, null);
    if (!borrowing) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Borrowing not found!] - [404]`);
        return res.status(404).send({
            message: "Borrowing not found!"
        });
    }

    if (req.user._id.toString() !== borrowing.user_id.toString()) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Forbidden! when trying to get borrowing details] - [401]`);
        return res.status(401).send({
            message: "Forbidden!"
        });
    }

    Borrowing_Details.find({ borrowing_id: id }, { __v: 0 }, null)
        .then(data => {
            let books = [];
            data.forEach(borrowing_details => {
                books.push(Book.findById(borrowing_details.book_id, { __v: 0 }, null));
            });
            Promise.all(books)
                .then(data => {
                    writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Borrowing Details retrieved successfully.] - [200]`);
                    return res.status(200).send(data);
                })
                .catch(err => {
                    writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Some error occurred while retrieving the Borrowing Details.] - [${err}] - [500]`);
                    return res.status(500).send({
                        message: "Some error occurred while retrieving the Borrowing Details."
                    });
                });
        })
        .catch(err => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Some error occurred while retrieving the Borrowing Details.] - [${err}] - [500]`);
            return res.status(500).send({
                message: "Some error occurred while retrieving the Borrowing Details."
            });
        });
}



// Admin Functions
/**
 * Retrieve all Borrowings from the database.
 * GET /api/v2/borrow/admin
 */
exports.findAll = (req, res) => {
    let condition = {};
    if (req.query.user_id) {
        condition.user_id = req.query.user_id;
    }
    if (req.query.status) {
        condition.status = { $in: req.query.status.split(',') };
    }
    Borrowing.find(condition, { __v: 0 }, null)
        .then(data => {
            writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Borrowings retrieved successfully.] - [200]`);
            return res.status(200).send(data);
        })
        .catch(err => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Some error occurred while retrieving borrowings.] - [500]`);
            return res.status(500).send({
                message: err.message || "Some error occurred while retrieving borrowings."
            });
        });
}


/**
 * Find a single Borrowing Details with an id
 * GET /api/v2/borrow/admin/:id
 */
exports.findOne = async (req, res) => {
    let id = req.params.id;

    let borrowing = await Borrowing.findById(id, { __v: 0 }, null);
    if (!borrowing) {
        writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Borrowing not found!] - [404]`);
        return res.status(404).send({
            message: "Borrowing not found!"
        });
    }


    Borrowing_Details.find({ borrowing_id: id }, { __v: 0 }, null)
        .then(data => {
            let books = [];
            data.forEach(borrowing_details => {
                books.push(Book.findById(borrowing_details.book_id, { __v: 0 }, null));
            });
            Promise.all(books)
                .then(data => {
                    writeLog.info(`[${req.clientIp}] - [${req.user.email}] - [Borrowing Details retrieved successfully.] - [200]`);
                    res.status(200).send(data);
                })
                .catch(err => {
                    writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Some error occurred while retrieving the Borrowing Details.] - [${err}] - [500]`);
                    return res.status(500).send({
                        message: "Some error occurred while retrieving the Borrowing Details."
                    });
                });
        })
        .catch(err => {
            writeLog.error(`[${req.clientIp}] - [${req.user.email}] - [Some error occurred while retrieving the Borrowing Details.] - [${err}] - [500]`);
            return res.status(500).send({
                message: "Some error occurred while retrieving the Borrowing Details."
            });
        });
}