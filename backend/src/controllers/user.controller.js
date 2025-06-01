const User = require('../models/user.model');
const Event = require('../models/event.model');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Create a new user
// @route   POST /api/users/register
// @access  Public
const createUser = asyncHandler(async (req, res) => {
  // ...existing code...
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const userLogin = asyncHandler(async (req, res) => {
  // ...existing code...
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    // Fetch user with all fields by explicitly refreshing from database
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get registered events count
    const registeredEvents = await Event.find({
      registeredRollNumbers: user.rollNumber.toString()
    });
    
    // Get upcoming events (events with future dates)
    const today = new Date();
    const upcomingEvents = registeredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    });
    
    // Get completed events (past events)
    const completedEvents = registeredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < today;
    });
    
    // Convert Mongoose document to plain object to ensure all fields are accessible
    const userObject = user.toObject();
    
    // Create a response object with all user fields plus event counts
    const responseObj = {
      ...userObject,
      registeredEvents: registeredEvents.length,
      upcomingEvents: upcomingEvents.length,
      completedEvents: completedEvents.length,
      // Explicitly include all fields to ensure they're included
      studentId: user.rollNumber,
      joinedDate: user.createdAt
    };
    
    // Remove sensitive fields
    delete responseObj.password;
    
    // Return complete profile with all fields
    res.status(200).json(responseObj);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

// @desc    Get user profile directly by token
// @route   GET /api/users/profile-direct/:token
// @access  Public (but secured by token in URL)
const getUserProfileById = asyncHandler(async (req, res) => {
  try {
    // Get token from URL parameter
    const token = req.params.token;
    
    // Decode the token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    // Find user by ID directly
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get registered events count
    const registeredEvents = await Event.find({
      registeredRollNumbers: user.rollNumber.toString()
    });
    
    // Get upcoming events
    const today = new Date();
    const upcomingEvents = registeredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    });
    
    // Get completed events 
    const completedEvents = registeredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < today;
    });
    
    // Create response object with all fields
    const responseObj = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      rollNumber: user.rollNumber,
      studentId: user.rollNumber,
      department: user.department,
      hostel: user.hostel,
      address: user.address,
      pincode: user.pincode,
      mobileNumber: user.mobileNumber,
      alternateMail: user.alternateMail,
      programme: user.programme,
      specialization: user.specialization,
      isProfileComplete: user.isProfileComplete,
      registeredEvents: registeredEvents.length,
      upcomingEvents: upcomingEvents.length,
      completedEvents: completedEvents.length,
      joinedDate: user.createdAt
    };
    
    // Return complete profile with all fields
    res.status(200).json(responseObj);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    const { 
      department, 
      hostel, 
      address, 
      pincode, 
      mobileNumber, 
      alternateMail, 
      programme, 
      specialization 
    } = req.body;
    
    // Update fields if provided
    if (department) user.department = department;
    if (hostel) user.hostel = hostel;
    if (address) user.address = address;
    if (pincode) user.pincode = pincode;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (alternateMail) user.alternateMail = alternateMail;
    if (programme) user.programme = programme;
    if (specialization) user.specialization = specialization;
    
    // Check if profile is complete (minimum required fields)
    if (department && hostel && mobileNumber && programme) {
      user.isProfileComplete = true;
    }
    
    // Save updated user
    const updatedUser = await user.save();
    
    // Create response object with updated data
    const responseObj = {
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      rollNumber: updatedUser.rollNumber,
      department: updatedUser.department,
      hostel: updatedUser.hostel,
      address: updatedUser.address,
      pincode: updatedUser.pincode,
      mobileNumber: updatedUser.mobileNumber,
      alternateMail: updatedUser.alternateMail,
      programme: updatedUser.programme,
      specialization: updatedUser.specialization,
      isProfileComplete: updatedUser.isProfileComplete
    };
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: responseObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  // ...existing code...
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  // ...existing code...
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  // ...existing code...
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  // ...existing code...
});

// Get all students for admin
const getAllStudents = asyncHandler(async (req, res) => {
  try {
    const students = await User.find()
      .select('fullName rollNumber email events')
      .sort({ rollNumber: 1 });
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// Get student details by roll number
const getStudentByRoll = asyncHandler(async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    // Find the student
    const student = await User.findOne({ rollNumber })
      .select('fullName rollNumber email events');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get all events the student has registered for
    const registeredEvents = await Event.find({
      registeredRollNumbers: student.rollNumber.toString()
    }).select('eventName date time venue status attendanceRollNumbers attendanceRecorded');
    
    // Calculate attendance statistics
    const eventsAttended = registeredEvents.filter(event => 
      event.attendanceRecorded && 
      event.attendanceRollNumbers.includes(student.rollNumber.toString())
    );
    
    const attendanceRate = registeredEvents.length > 0 
      ? (eventsAttended.length / registeredEvents.length * 100).toFixed(2) 
      : 0;
    
    // Format the events with attendance status
    const eventsWithStatus = registeredEvents.map(event => ({
      id: event._id,
      name: event.eventName,
      date: event.date,
      time: event.time,
      venue: event.venue,
      status: event.status,
      attended: event.attendanceRecorded ? 
        event.attendanceRollNumbers.includes(student.rollNumber.toString()) : 
        null
    }));
    
    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          fullName: student.fullName,
          rollNumber: student.rollNumber,
          email: student.email
        },
        analytics: {
          totalEvents: registeredEvents.length,
          eventsAttended: eventsAttended.length,
          attendanceRate: attendanceRate
        },
        events: eventsWithStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student details',
      error: error.message
    });
  }
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  userLogin,
  getUserProfile,
  getUserProfileById,
  updateUserProfile,
  getAllStudents,
  getStudentByRoll
};