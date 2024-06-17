const multer = require('multer');
const {validateBufferMIMEType} = require('validate-image-type');
let fs = require('fs');
let writeLog = require('../helper/log.helper');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage
});

// Middleware to filter file type
const imageFilterMiddleware = async (req, res, next) => {
    if (!req.file) {
        next();
    }

    let buffer = fs.readFileSync(req.file.path);

    const validationResult = await validateBufferMIMEType(buffer, {
        originalFilename: req.file.originalname,
        allowMimeTypes: ['image/jpeg', 'image/gif', 'image/png', 'image/svg+xml'],
    });
    if (!validationResult.ok) {
        // Delete file if invalid
        fs.unlinkSync(req.file.path);
        writeLog.error(`[${req.clientIp}] - [${req.originalUrl}] - [${req.method}] - [${req.protocol}] - Invalid file type`)
        return res.status(400).json({message: 'Invalid file type'});
    }
    next();
};

module.exports = { upload, imageFilterMiddleware };
