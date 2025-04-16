const express = require('express');
const router = express.Router();
const { 
    createEvent, 
    getEvents, 
    updateEventStatus, 
    deleteEvent, 
    getUpcomingEvents, 
    registerForEvent,
    cancelEventRegistration  // Add this new controller function import
} = require('../controllers/event.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const User = require('../models/user.model'); // Add this at the top
const Event = require('../models/event.model');  // Add this at the top with other imports

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
      select: 'eventName speaker description date time venue status createdAt'
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

// Update the delete registration route
router.delete('/:id/register', protect, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        const user = await User.findById(userId);

        // Find the event and update its registeredUsers array
        const event = await Event.findByIdAndUpdate(eventId, {
            $pull: { registeredRollNumbers: user.rollNumber.toString() },
            $inc: { registeredUsers: -1 }  // Decrement registered users count
        }, { new: true });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Remove event from user's events array
        await User.findByIdAndUpdate(userId, {
            $pull: { events: eventId }
        });

        res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update event status - protected route for admins
router.put('/:id/status', protect, admin, updateEventStatus);

// Delete event - protected route for admins
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;