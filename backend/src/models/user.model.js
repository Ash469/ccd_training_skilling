const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  rollNumber: {
    type: Number,
    required: [true, 'Roll number is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  microsoftId: {
    type: String,
    sparse: true,
    unique: true
  },
  // Updated fields
  department: {
    type: String
  },
  hostel: {
    type: String
  },
  address: {
    type: String
  },
  pincode: {
    type: String
  },
  mobileNumber: {
    type: String
  },
  alternateMail: {
    type: String
  },
  programme: {
    type: String
  },
  specialization: {
    type: String
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  canRegisterAgain: { 
    type: Boolean, default: true 
  },
  registeredPanelSlot: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Panel.slots' 
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);