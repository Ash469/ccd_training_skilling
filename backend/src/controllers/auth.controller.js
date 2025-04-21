const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const Event = require('../models/event.model');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('events');

    const stats = await Event.aggregate([
      {
        $match: {
          _id: { $in: user.events }
        }
      },
      {
        $group: {
          _id: null,
          registeredEvents: { $sum: 1 },
          upcomingEvents: {
            $sum: {
              $cond: [{ $gt: ['$date', new Date()] }, 1, 0]
            }
          },
          completedEvents: {
            $sum: {
              $cond: [{ $lt: ['$date', new Date()] }, 1, 0]
            }
          }
        }
      }
    ]);

    const userProfile = {
      fullName: user.fullName,
      email: user.email,
      studentId: user.rollNumber,
      joinedDate: user.createdAt,
      registeredEvents: stats[0]?.registeredEvents || 0,
      upcomingEvents: stats[0]?.upcomingEvents || 0,
      completedEvents: stats[0]?.completedEvents || 0
    };

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

const microsoftAuth = async (req, res) => {
  try {
    const { accessToken, accountType } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    // Get user info from Microsoft Graph API
    const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const microsoftUser = graphResponse.data;
    
    // Check if user should be admin or regular user
    let user;
    let role = accountType || 'user';
    
    if (role === 'admin') {
      // Check if admin exists with this email
      user = await Admin.findOne({ email: microsoftUser.mail || microsoftUser.userPrincipalName });
      
      if (!user) {
        // Admin does not exist, check if there's an admin allowlist or create new admin
        const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
        
        if (adminEmails.includes(microsoftUser.mail || microsoftUser.userPrincipalName)) {
          // Create admin
          user = await Admin.create({
            email: microsoftUser.mail || microsoftUser.userPrincipalName,
            password: `microsoft-${Date.now()}` // Generate random password (won't be used)
          });
        } else {
          return res.status(403).json({
            success: false,
            message: 'This email is not authorized for admin access'
          });
        }
      }
    } else {
      // Handle regular user
      user = await User.findOne({ email: microsoftUser.mail || microsoftUser.userPrincipalName });
      
      if (!user) {
        // Extract email and try to parse rollNumber from email (if institutional email)
        const email = microsoftUser.mail || microsoftUser.userPrincipalName;
        let rollNumber;
        
        // Try to extract roll number from email if it's in a format like 230104023@iitg.ac.in
        // Extract roll number from email if it follows a pattern like 230104023@iitg.ac.in
        const rollNumberMatch = email.match(/^(\d{9})@/);
        if (rollNumberMatch) {
          rollNumber = parseInt(rollNumberMatch[1]);
        } else {
          // Use surname as roll number if available
          rollNumber = microsoftUser.surname || '';
        }
        
        // Create new user with Microsoft data
        user = await User.create({
          fullName: microsoftUser.givenName,
          email: email,
          rollNumber: rollNumber,
          microsoftId: microsoftUser.id,
          password: `microsoft-${Date.now()}` // Generate random password (won't be used)
        });
      } else {
        // Update existing user with latest Microsoft info
        user.fullName = microsoftUser.givenName;
        user.microsoftId = microsoftUser.id;
        await user.save();
      }
    }
    
    // Generate JWT token
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
    console.error('Microsoft auth error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error during Microsoft authentication'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  microsoftAuth
};