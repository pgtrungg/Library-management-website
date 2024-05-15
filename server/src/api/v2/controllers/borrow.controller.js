let {Borrowing, Borrowing_Details} = require('../models/borrow.model');
let {Book} = require('../models/book.model');
let {User} = require('../models/user.model');


// User Functions

/**
 * Create and Save a new Borrowing
 * POST /api/v2/borrow
 * Request: {user_id, book_list: [{book_id, quantity}], days}
 */
exports.borrow = async (req, res) => {
    // Validate request
    if (!req.body.user_id || !req.body.book_list || !req.body.days) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    if (req.user._id.toString() !== req.body.user_id) {
        res.status(401).send({
            message: "Forbidden!"
        });
        return;
    }

    // Check if user exists
    let user = await User.findById(req.body.user_id);
    if (!user) {
        res.status(404).send({
            message: "User not found!"
        });
        return;
    }

    let books = [];

    // Check if book exists
    for (let i = 0; i < req.body.book_list.length; i++) {
        let book = await Book.findById(req.body.book_list[i].book_id);
        if (!book) {
            res.status(404).send({
                message: "Book not found!"
            });
            return;
        }
        if (book.quantity < req.body.book_list[i].quantity) {
            res.status(400).send({
                message: "Not enough books in stock!"
            });
            return;
        }
        books.push(book);
    }

    // Create a Borrowing
    let borrowing = new Borrowing({
        user_id: req.body.user_id,
        borrow_date: new Date(),
        return_date: new Date(new Date().getTime() + req.body.days * 24 * 60 * 60 * 1000)
    });

    // Save Borrowing in the database
    borrowing.save()
        .then(data => {
            let borrowing_details = [];
            for (let i = 0; i < req.body.book_list.length; i++) {
                borrowing_details.push(new Borrowing_Details({
                    borrowing_id: data._id,
                    book_id: books[i]._id
                }));
                books[i].quantity -= req.body.book_list[i].quantity;
            }
            Borrowing_Details.insertMany(borrowing_details, null)
                .then(data => {
                    books.forEach(book => {
                        book.save();
                    });
                    res.send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the Borrowing_Details."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Borrowing."
            });
        });
}


/**
 * Get own Borrowings
 * GET /api/v2/borrow
 */
exports.borrowings = (req, res) => {
    Borrowing.find({ user_id: req.user._id }, { __v: 0 }, null)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            if (process.env.NODE_ENV === 'development')
                console.log(err);
            res.status(500).send({
                message: "Some error occurred while retrieving borrowings."
            });
        });
}


/**
 * Return a Borrowing
 * PUT /api/v2/borrow/:id
 */
exports.return = async (req, res) => {
    let id = req.params.id;

    let borrowing = await Borrowing.findById(id, { __v: 0 }, null);
    if (!borrowing) {
        res.status(404).send({
            message: "Borrowing not found!"
        });
        return;
    }

    if (req.user._id.toString() !== borrowing.user_id.toString()) {
        res.status(401).send({
            message: "Forbidden!"
        });
        return;
    }

    if (borrowing.status === 'returned') {
        res.status(400).send({
            message: "Borrowing already returned!"
        });
        return;
    }

    borrowing.actual_return_date = new Date();
    borrowing.status = 'returned';

    borrowing.save()
        .then(() => {
            Borrowing_Details.find({ borrowing_id: id }, { __v: 0 }, null)
                .then(data => {
                    let books = [];
                    data.forEach(borrowing_details => {
                        books.push(Book.findById(borrowing_details.book_id));
                    });
                    Promise.all(books)
                        .then(data => {
                            data.forEach(book => {
                                book.quantity++;
                                book.save();
                            });
                            res.send(data);
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: err.message || "Some error occurred while returning the Borrowing."
                            });
                        });
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while returning the Borrowing."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while returning the Borrowing."
            });
        });
}


/**
 * Get borrowing details
 * GET /api/v2/borrow/:id
 */
exports.details = async (req, res) => {
    let id = req.params.id;

    let borrowing = await Borrowing.findById(id, { __v: 0 }, null);
    if (!borrowing) {
        res.status(404).send({
            message: "Borrowing not found!"
        });
        return;
    }

    if (req.user._id.toString() !== borrowing.user_id.toString()) {
        res.status(401).send({
            message: "Forbidden!"
        });
        return;
    }

    Borrowing_Details.find({ borrowing_id: id }, { __v: 0 }, null)
        .then(data => {
            let books = [];
            data.forEach(borrowing_details => {
                books.push(Book.findById(borrowing_details.book_id));
            });
            Promise.all(books)
                .then(data => {
                    res.send(data);
                })
                .catch(err => {
                    if (process.env.NODE_ENV === 'development')
                        console.log(err);
                    res.status(500).send({
                        message: "Some error occurred while retrieving the Borrowing Details."
                    });
                });
        })
        .catch(err => {
            if (process.env.NODE_ENV === 'development')
                console.log(err);
            res.status(500).send({
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
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
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
        res.status(404).send({
            message: "Borrowing not found!"
        });
        return;
    }


    Borrowing_Details.find({ borrowing_id: id }, { __v: 0 }, null)
        .then(data => {
            let books = [];
            data.forEach(borrowing_details => {
                books.push(Book.findById(borrowing_details.book_id));
            });
            Promise.all(books)
                .then(data => {
                    res.send(data);
                })
                .catch(err => {
                    if (process.env.NODE_ENV === 'development')
                        console.log(err);
                    res.status(500).send({
                        message: "Some error occurred while retrieving the Borrowing Details."
                    });
                });
        })
        .catch(err => {
            if (process.env.NODE_ENV === 'development')
                console.log(err);
            res.status(500).send({
                message: "Some error occurred while retrieving the Borrowing Details."
            });
        });
}