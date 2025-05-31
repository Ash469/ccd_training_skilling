const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { 
    createEvent, 
    getEvents, 
    updateEventStatus, 
    deleteEvent, 
    getUpcomingEvents, 
    registerForEvent,
    uploadAttendance,
    getEventAttendance,
    updateCancellationPolicy
} = require('../controllers/event.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Event = require('../models/event.model');

// Configure multer for attendance uploads (CSV)
const csvStorage = multer.memoryStorage();
const csvUpload = multer({ storage: csvStorage });

// Add a debug endpoint to test connection - keep this BEFORE any parameterized routes
router.get('/debug', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is working',
    timestamp: new Date().toISOString()
  });
});

// Enhanced debugging endpoint
router.get('/debug-admin', protect, (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  // Try to find one event
  Event.findOne().then(event => {
    res.status(200).json({
      success: true,
      message: 'Debug endpoint',
      user: {
        id: userId,
        role: userRole,
        isAdmin: userRole === 'admin'
      },
      dbConnection: {
        status: 'connected',
        foundEvent: event ? true : false
      },
      timestamp: new Date().toISOString()
    });
  }).catch(err => {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  });
});

// Protected route - only authenticated admins can create events
router.post('/create', protect, admin, createEvent);

// Get all events - protected route for admins
router.get('/', protect, admin, getEvents);

// Get upcoming events - public route
router.get('/upcoming', getUpcomingEvents);

// Register for event - protected route for authenticated users
router.post('/:id/register', protect, registerForEvent);

// Get user's registered events
router.get('/user/registered', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'events',
      select: 'eventName speaker description date time venue status createdAt isCancellationAllowed'
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.events);
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route - only authenticated admins can update cancellation policy
router.put('/:id/cancellation-policy', protect, admin, updateCancellationPolicy);

// Update the delete registration route
router.delete('/:id/register', protect, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        // Check if user exists before accessing user properties
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Find the event and check if cancellation is allowed
        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }
        
        // Check if cancellation is allowed for this event
        if (!event.isCancellationAllowed) {
            return res.status(403).json({
                success: false,
                message: 'Cancellation is not allowed for this event'
            });
        }

        // Update the event's registration data
        await Event.findByIdAndUpdate(eventId, {
            $pull: { registeredRollNumbers: user.rollNumber.toString() },
            $inc: { registeredUsers: -1 }
        });

        // Remove event from user's events array
        await User.findByIdAndUpdate(userId, {
            $pull: { events: eventId }
        });

        res.json({ 
            success: true,
            message: 'Registration cancelled successfully' 
        });
    } catch (error) {
        console.error('Error cancelling registration:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});

router.get('/:id/registrations', protect, admin, async (req, res) => {
    try {
        // console.log('Registration endpoint called with ID:', req.params.id);
        const eventId = req.params.id;
        
        // Validate MongoDB ObjectId format
        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid event ID format' 
            });
        }

        const event = await Event.findById(eventId);
        // console.log('Event found:', event ? 'Yes' : 'No');
        
        if (!event) {
            return res.status(404).json({ 
                success: false,
                message: 'Event not found' 
            });
        }

       
        // console.log('Registered roll numbers:', event.registeredRollNumbers || []);

        let registeredUsers = [];
        if (event.registeredRollNumbers && event.registeredRollNumbers.length > 0) {
            registeredUsers = await User.find({
                rollNumber: { $in: event.registeredRollNumbers }
            }).select('fullName rollNumber email');
            
            // console.log('Found users:', registeredUsers.length);
        }

        return res.status(200).json({
            success: true,
            data: registeredUsers,
            eventName: event.eventName
        });

    } catch (error) {
        console.error('Error fetching registrations:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching registrations',
            error: error.message
        });
    }
});


router.put('/:id/status', protect, admin, updateEventStatus);

router.delete('/:id', protect, admin, deleteEvent);

// Upload attendance for an event
router.post('/:id/attendance', protect, admin, csvUpload.single('attendanceFile'), uploadAttendance);

// Get event attendance details
router.get('/:id/attendance', protect, admin, getEventAttendance);

module.exports = router;