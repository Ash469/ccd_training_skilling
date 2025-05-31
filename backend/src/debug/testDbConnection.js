const mongoose = require('mongoose');
const Event = require('../models/event.model');
const User = require('../models/user.model');

// Get MongoDB URI from environment or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ccd_training_skilling';

async function testDbConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Test User collection
    console.log('Testing User collection...');
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    // Test Event collection
    console.log('Testing Event collection...');
    const eventCount = await Event.countDocuments();
    console.log(`Found ${eventCount} events in the database`);
    
    if (eventCount > 0) {
      const latestEvent = await Event.findOne().sort({ createdAt: -1 });
      console.log('Most recent event:', latestEvent);
    }
    
    console.log('Database tests completed successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDbConnection();
