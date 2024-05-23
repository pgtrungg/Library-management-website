let express = require('express');
let router = express.Router();
let csrf = require('../middlewares/csrf.middleware');

let bookRouter = require('./book.routes');
let userRouter = require('./user.routes');
let borrowRouter = require('./borrow.routes');
let authRouter = require('./auth.routes');

router.use('/books', csrf.csrfMiddleware, bookRouter);
router.use('/users', csrf.csrfMiddleware, userRouter);
router.use('/borrow', csrf.csrfMiddleware, borrowRouter);
router.use('/auth', authRouter);



module.exports = router;

