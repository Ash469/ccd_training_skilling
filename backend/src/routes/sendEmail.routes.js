const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user.model'); 

const router = express.Router();

router.post('/send-email', async (req, res) => {
    const { subject, body } = req.body;
  
    try {
      console.log('Request received for sending emails');
  
      const users = await User.find();
      console.log(`Found ${users.length} users`);
  
      const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, 
        auth: {
          user: process.env.OUTLOOK_EMAIL,
          pass: process.env.OUTLOOK_PASSWORD
        },
        tls: {
          ciphers: 'SSLv3'
        }
      });
  
      for (let user of users) {
        console.log(`Sending email to ${user.email}`);
        await transporter.sendMail({
          from: process.env.OUTLOOK_EMAIL,
          to: user.email,
          subject,
          text: body
        });
      }
  
      res.status(200).json({ message: 'Emails sent successfully to all users' });
    } catch (error) {
      console.error('Email send failed:', error);
      res.status(500).json({ error: 'Failed to send emails' });
    }
  });
  
module.exports = router;
