const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');

// Protect routes middleware
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token - include all fields except password
      req.user = await User.findById(decoded.id)
        .select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          message: "Not authorized, user not found"
        });
      }
      
      next();
    } catch (error) {
      res.status(401).json({
        message: "Not authorized, token failed",
        error: error.message
      });
    }
  } else {
    res.status(401).json({
      message: "Not authorized, no token"
    });
  }
});

// Admin middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({
      message: "Not authorized as an admin"
    });
  }
};