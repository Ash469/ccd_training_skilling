const mongoose = require('mongoose');

const allowedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phase: {
    type: String,
    enum: ['phase1', 'phase2'], 
    default: 'phase1'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AllowedUser', allowedUserSchema);
