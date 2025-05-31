const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  microsoftAuth, 
  addAllowedUser, 
  getAllowedUsers, 
  removeAllowedUser,
  checkEmailAccess,
  updateUserProfile,
  getProfileStatus
} = require('../controllers/auth.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users/profile', protect, getProfile);
router.post('/microsoft-auth', microsoftAuth);
router.post('/check-email-access', checkEmailAccess);

// Add new profile routes
router.put('/update-profile', protect, updateUserProfile);
router.get('/profile-status', protect, getProfileStatus);

// Allowed users management (admin only)
router.post('/allowed-users', protect, admin, addAllowedUser);
router.get('/allowed-users', protect, admin, getAllowedUsers);
router.delete('/allowed-users/:id', protect, admin, removeAllowedUser);

module.exports = router;