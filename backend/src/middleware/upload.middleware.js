const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // limit file size to 5MB
  },
  fileFilter: function (req, file, cb) {
    // Accept only csv files
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' || 
        file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

module.exports = { upload };
