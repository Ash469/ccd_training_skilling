const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  }
}, {
  timestamps: true
});

// Method to compare password - direct string comparison
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return this.password === enteredPassword;  // Direct string comparison
};

module.exports = mongoose.model('Admin', adminSchema);