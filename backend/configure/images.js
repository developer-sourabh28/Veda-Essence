const multer = require('multer');

// Memory storage (no saving on local disk)
const storage = multer.memoryStorage();

// File type filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|png|jpg|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(file.originalname.toLowerCase());

    if (mimeType && extName) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
