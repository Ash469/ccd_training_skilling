const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  speaker: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // Legacy fields - maintain for backward compatibility
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        // Skip validation if the document already exists (for updates)
        if (this.isNew) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        }
        return true; // Always pass validation for existing documents
      },
      message: 'Event date must be a future date'
    }
  },
  time: {
    type: String,
    required: true
  },
  // New fields for better time management
  startDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.isNew && value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        }
        return true;
      },
      message: 'Start date must be a future date'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.startDate && value) {
          return value >= this.startDate;
        }
        return true;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  maxSeats: {
    type: Number,
    required: true,
    min: 1
  },
  registeredUsers: {
    type: Number,
    default: 0,
    min: 0
  },
  registeredRollNumbers: [{
    type: String,
    trim: true
  }],
  attendanceRecorded: {
    type: Boolean,
    default: false
  },
  attendanceRollNumbers: [{
    type: String,
    trim: true
  }],
  attendanceDate: {
    type: Date
  },
  promotionLink: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure this matches your User model name
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  eventId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isCancellationAllowed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Event', eventSchema);