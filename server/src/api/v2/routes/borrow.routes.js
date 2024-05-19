let express = require('express');
let router = express.Router();

let borrowController = require('../controllers/borrow.controller');
let auth = require('../middlewares/auth.middleware');


// Borrow Functions of User
router.route('/')
    .post(auth.authMiddleware, borrowController.borrow)  // POST /api/v2/borrow - Borrow a Book (User)
    .get(auth.authMiddleware, borrowController.borrowings); // GET /api/v2/borrow - Retrieve all Borrowings of a User (User)

router.route('/:borrowId')
    .get(auth.authMiddleware, borrowController.findOne) // GET /api/v2/borrow/:borrowId - Retrieve a single Borrowing with id (User)
    .put(auth.authMiddleware, borrowController.return) // PUT /api/v2/borrow/:borrowId - Return a Borrowing with id (User)


// Borrow Functions of Admin
router.route('/admin/all')
    .get(auth.adminMiddleware, borrowController.findAll); // GET /api/v2/borrow/admin - Retrieve all Borrowings from the database (Admin)

router.route('/admin/:borrowId')
    .get(auth.adminMiddleware, borrowController.findOne); // GET /api/v2/borrow/admin/:borrowId - Retrieve a single Borrowing with id (Admin)

module.exports = router;