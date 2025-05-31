const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const { 
  createUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getAllStudents, 
  getStudentByRoll,
  userLogin,
  getUserProfile,
  updateUserProfile,
  getUserProfileById
} = require('../controllers/user.controller');

// Debug route to test the API
router.get('/debug', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User API is working',
    timestamp: new Date().toISOString()
  });
});

// User routes
// router.post('/register', createUser);
router.post('/login', userLogin);
router.get('/profile', protect, getUserProfile);
router.get('/profile-direct/:token', getUserProfileById); // Add a direct route that doesn't use middleware
router.put('/profile', protect, updateUserProfile);

// Student routes - protected for admin only
router.get('/students', protect, admin, getAllStudents);  
router.get('/students/:rollNumber', protect, admin, getStudentByRoll);

// Admin routes - these should come after the /students routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;