const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes'); 
const sendEmailRoutes = require('./routes/sendEmail.routes');

require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Training  And Skilling Portal API Server is running');
});
app.use('/api', authRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/email', sendEmailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


