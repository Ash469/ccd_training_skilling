const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');

// Protect routes middleware
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get the token from the header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - no token'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Log the decoded token for debugging
    console.log('Decoded token:', decoded);

    // Check the role in the token
    const role = decoded.role;

    // Based on the role, find the user from the appropriate collection
    let user;
    if (role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found with this ID'
        });
      }
    } else {
      user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found with this ID'
        });
      }
    }
    
    // Add user and role info to the request
    req.user = user;
    req.user.role = role; // Explicitly add role to the request user object
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - token invalid'
    });
  }
});

// Admin middleware
exports.admin = async (req, res, next) => {
  // Check if req.user and req.user.role exists (should be set by protect middleware)
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this route - admin access required'
    });
  }
  
  next();
};