let express = require('express');
let router = express.Router();

let v2Router = require('./v2/routes/index');

router.use('/v2', v2Router);

module.exports = router;