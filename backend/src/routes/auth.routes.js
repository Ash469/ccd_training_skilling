const express = require('express');
const router = express.Router();
const { register, login, getProfile, microsoftAuth } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users/profile', protect, getProfile);
router.post('/microsoft-auth', microsoftAuth);

module.exports = router;