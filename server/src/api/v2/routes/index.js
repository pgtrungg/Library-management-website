let express = require('express');
let router = express.Router();

let bookRouter = require('./book.routes');
let userRouter = require('./user.routes');
let borrowRouter = require('./borrow.routes');
let authRouter = require('./auth.routes');

router.use('/books', bookRouter);
router.use('/users', userRouter);
router.use('/borrow', borrowRouter);
router.use('/auth', authRouter);



module.exports = router;

