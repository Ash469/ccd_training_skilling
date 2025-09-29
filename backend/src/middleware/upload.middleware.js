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
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (
      allowedTypes.includes(file.mimetype) ||
      file.originalname.endsWith('.csv') ||
      file.originalname.endsWith('.xls') ||
      file.originalname.endsWith('.xlsx')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV or Excel files are allowed'), false);
    }
  }
});

module.exports = { upload };
