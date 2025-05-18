const Event = require('../models/event.model');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      speaker,
      description,
      date,
      time,
      venue,
      maxSeats,
      sendEmail
    } = req.body;

    // Create new event
    const event = new Event({
      eventName,
      speaker,
      description,
      date,
      time,
      venue,
      maxSeats,
      createdBy: req.admin_id// Assuming you have user info in req.user from auth middleware
    });

    // Save event to database
    await event.save();

    // If sendEmail is true, you can implement email notification logic here
    if (sendEmail) {
      // TODO: Implement email notification system
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({})
        .sort({ date: 1 }) // Sort by date in ascending order
        .select('-__v'); // Exclude version key

    res.status(200).json({
        success: true,
        count: events.length,
        data: events
    });
});

const getUpcomingEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ 
        status: 'upcoming'
       
    })
    .sort({ date: 1 }) // Sort by date in ascending order
    .select('-registeredRollNumbers -createdBy -__v'); // Exclude sensitive fields

    const formattedEvents = events.map(event => ({
        id: event._id,
        name: event.eventName,
        description: event.description,
        date: event.date,
        time: event.time,
        speaker: event.speaker,
        venue: event.venue,
        maxSeats: event.maxSeats,
        seatsAvailable: event.maxSeats - event.registeredUsers,
        status: event.status
    }));

    res.status(200).json({
        success: true,
        count: events.length,
        data: formattedEvents
    });
});

const updateEventStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = status;
        await event.save();

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating event status',
            error: error.message
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting event',
            error: error.message
        });
    }
};

const registerForEvent = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: 'Event not found'
        });
    }

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Check if user is already registered
    if (event.registeredRollNumbers.includes(user.rollNumber.toString())) {
        return res.status(400).json({
            success: false,
            message: 'You are already registered for this event'
        });
    }

    // Check if seats are available
    if (event.registeredUsers >= event.maxSeats) {
        return res.status(400).json({
            success: false,
            message: 'Event is full'
        });
    }

    // Update event
    event.registeredUsers += 1;
    event.registeredRollNumbers.push(user.rollNumber.toString());
    await event.save();

    // Update user's events array
    user.events.push(eventId);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Successfully registered for the event'
    });
});

module.exports = {
  createEvent,
  getEvents,
  getUpcomingEvents,
  updateEventStatus,
  deleteEvent,
  registerForEvent
};