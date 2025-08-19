const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const Event = require('../models/event.model');
const AllowedUser = require('../models/allowedUser.model');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Export all functions directly to avoid duplicate exports
exports.register = async (req, res) => {
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

exports.login = async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    let user;
    let role;

    if (accountType === 'admin') {
      // For admin login, check if email exists in the Admin collection
      user = await Admin.findOne({ email });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'This email is not authorized for admin access'
        });
      }
      
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
    const userResponse = user;
    delete userResponse.password;

    // Make sure role is included in the response data object directly
    userResponse.role = role;
    userResponse.programme = user.programme || "Not Specified";

    res.status(200).json({
      success: true,
      data: {
        ...userResponse,
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

exports.getProfile = async (req, res) => {
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
        }
      }
    ]);

    const userProfile = {
      fullName: user.fullName,
      email: user.email,
      studentId: user.rollNumber,
      joinedDate: user.createdAt,
      registeredEvents: stats[0]?.registeredEvents || 0,
      programme: user.programme || "Not Specified"
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

// Update the updateUserProfile function to include course
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      department,
      hostel,
      address,
      mobileNumber,
      alternateMail,
      course
    } = req.body;

    // Find user by id
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user profile
    user.department = department || user.department;
    user.hostel = hostel || user.hostel;
    user.address = address || user.address;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.alternateMail = alternateMail || user.alternateMail;
    user.course = course || user.course;
    
    // Set profile as complete if all required fields are filled
    if (department && hostel && mobileNumber && course) {
      user.isProfileComplete = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        department: user.department,
        hostel: user.hostel,
        address: user.address,
        mobileNumber: user.mobileNumber,
        alternateMail: user.alternateMail,
        course: user.course,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Add this function to get profile completion status
exports.getProfileStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      isProfileComplete: user.isProfileComplete,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        department: user.department,
        hostel: user.hostel,
        address: user.address,
        mobileNumber: user.mobileNumber,
        alternateMail: user.alternateMail
      }
    });
  } catch (error) {
    console.error('Error getting profile status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile status'
    });
  }
};

exports.microsoftAuth = async (req, res) => {
  try {
    const { accessToken, accountType, email } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // For student accounts, check if the email is in the allowed list
    if (accountType === 'user' && email) {
      const isAllowed = await AllowedUser.findOne({ email: email.toLowerCase() });
      
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Your email is not on the authorized list. Please contact CCD for access.'
        });
      }
    }

    // Get user info from Microsoft Graph API
    const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const microsoftUser = graphResponse.data;
    const userEmail = microsoftUser.mail || microsoftUser.userPrincipalName;
    
    // Check if user should be admin or regular user
    let user;
    let role = accountType || 'user';
    
    if (role === 'admin') {
      // Check if the email exists in the Admin collection
      user = await Admin.findOne({ email: userEmail });
      
      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'This email is not authorized for admin access'
        });
      }
    } else {
      // Handle regular user
      user = await User.findOne({ email: userEmail });
      
      if (!user) {
        // Extract email and try to parse rollNumber from email (if institutional email)
        let rollNumber;
        
        // Use surname as roll number since it's embedded in the email
        rollNumber = microsoftUser.surname || '';
        
        // If surname is not available, we'll attempt to extract from email patterns
        if (!rollNumber && userEmail.includes('@')) {
          const emailParts = userEmail.split('@');
          // Check if the first part could contain the roll number
          if (emailParts[0]) {
            const numericMatch = emailParts[0].match(/\d+/);
            if (numericMatch) {
              rollNumber = numericMatch[0];
            }
          }
        }
        
        // Create new user with Microsoft data
        user = await User.create({
          fullName: microsoftUser.givenName,
          email: userEmail,
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
      message: 'Successfully authenticated with Microsoft',
      data: {
        token,
        role,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        isProfileComplete: user.isProfileComplete,
        programme: user.programme || "Not Specified"
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

exports.addAllowedUser = async (req, res) => {
  try {
    const { email, phase } = req.body;

    // Handle both single email and array of emails
    const emails = Array.isArray(email) ? email : [email];
    
    if (!emails.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one email is required'
      });
    }
    
    const results = [];
    const errors = [];
    
    // Process each email
    for (const singleEmail of emails) {
      try {
        if (!singleEmail) continue;
        
        // Check if already exists
        let allowedUser = await AllowedUser.findOne({ email: singleEmail.toLowerCase() });
        
        if (allowedUser) {
          errors.push({
            email: singleEmail,
            message: 'Email already added to allowed users'
          });
          continue;
        }
        
        allowedUser = new AllowedUser({
          email: singleEmail.toLowerCase(),
          phase: phase
        });
        
        await allowedUser.save();
        results.push(allowedUser);
      } catch (emailError) {
        errors.push({
          email: singleEmail,
          message: emailError.message
        });
      }
    }
    
    return res.status(201).json({
      success: true,
      message: `${results.length} users added to allowed list successfully`,
      data: results,
      errors: errors.length ? errors : undefined
    });
  } catch (error) {
    console.error('Add allowed user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while adding users to allowed list'
    });
  }
};

exports.getAllowedUsers = async (req, res) => {
  try {
    const allowedUsers = await AllowedUser.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: allowedUsers.length,
      data: allowedUsers
    });
  } catch (error) {
    console.error('Get allowed users error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving allowed users'
    });
  }
};

exports.removeAllowedUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedUser = await AllowedUser.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in allowed list'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User removed from allowed list successfully'
    });
  } catch (error) {
    console.error('Remove allowed user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while removing user from allowed list'
    });
  }
};

exports.checkEmailAccess = async (req, res) => {
  try {
    const { email, accountType } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    let allowed = false;
    let message = 'Email is not authorized to access the portal';
    
    if (accountType === 'admin') {
      // For admin, check if the email exists in Admin collection
      const adminExists = await Admin.findOne({ email: email.toLowerCase() });
      allowed = !!adminExists;
      message = allowed ? 
        'Email is authorized for admin access' : 
        'Email is not authorized for admin access';
    } else {
      // For regular users, check if email is in allowed list
      const isAllowed = await AllowedUser.findOne({ email: email.toLowerCase() });
      allowed = !!isAllowed;
      message = allowed ? 
        'Email is authorized to access the portal' : 
        'Email is not authorized to access the portal';
    }
    
    return res.status(200).json({
      success: true,
      allowed,
      message
    });
  } catch (error) {
    console.error('Email access check error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while checking email access'
    });
  }
};