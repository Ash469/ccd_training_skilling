const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { fullName, email, rollNumber, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { rollNumber }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this email or student ID' 
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      rollNumber,
      password
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    let user;
    let role;

    if (accountType === 'admin') {
      user = await Admin.findOne({ email });
      role = 'admin';
    } else {
      user = await User.findOne({ email });
      role = 'user';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { 
        id: user._id,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      data: {
        ...userResponse,
        role,
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login
};