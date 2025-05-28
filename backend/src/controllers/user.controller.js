const User = require('../models/user.model');
const Event = require('../models/event.model');
const asyncHandler = require('express-async-handler');

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
  // ...existing code...
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // ...existing code...
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
    // Log for debugging
    console.log("getAllStudents controller called");
    
    const students = await User.find()
      .select('fullName rollNumber email events')
      .sort({ rollNumber: 1 });
    
    // Log the result
    console.log(`Found ${students.length} students`);
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error("Error in getAllStudents:", error);
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
    // Log for debugging
    console.log("getStudentByRoll controller called with roll:", req.params.rollNumber);
    
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
    console.error('Error fetching student details:', error);
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
  updateUserProfile,
  getAllStudents,
  getStudentByRoll
};