const nodemailer = require('nodemailer');

/**
 * Utility for sending emails
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text content
 * @param {String} options.html - HTML content (optional)
 * @returns {Promise} - Returns promise that resolves after sending email
 */
exports.sendEmail = async (options) => {
  try {
    // Create a transporter with Outlook config
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

    // Email options
    const mailOptions = {
      from: process.env.OUTLOOK_EMAIL,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || undefined
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send event notification emails to multiple users
 * @param {Object} eventDetails - Event information
 * @param {Array} users - List of user objects with email property
 * @returns {Promise} - Promise that resolves when all emails are sent
 */
exports.sendEventNotificationEmails = async (eventDetails, users) => {
  try {
    console.log(`Preparing to send notifications to ${users.length} users`);
    
   
    
    const { eventName, date, time, venue, speaker, description } = eventDetails;
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let successCount = 0;
    let errorCount = 0;
    
    // Send emails to each user
    for (const user of users) {
      try {
        const emailSubject = `New Event: ${eventName}`;
        const emailText = 
          `Hello ${user.fullName || 'Student'},\n\n` +
          `A new event has been scheduled at IIT Guwahati and is now open for registration:\n\n` +
          `Event: ${eventName}\n` +
          `Date: ${formattedDate}\n` +
          `Time: ${time}\n` +
          `Venue: ${venue}\n` +
          `Speaker: ${speaker}\n\n` +
          `Description: ${description}\n\n` +
          `You can register for this event through the Training and Skilling Portal at ${FRONTEND_URL}\n\n` +
          `Regards,\n` +
          `Career & Competency Development Cell\n` +
          `IIT Guwahati`;

        const emailHtml = 
          `<div style="font-family: Arial, sans-serif; line-height: 1.6;">` +
          `<p>Hello ${user.fullName || 'Student'},</p>` +
          `<p>A new event has been scheduled at IIT Guwahati and is now open for registration:</p>` +
          `<div style="margin: 20px 0; padding: 15px; border-left: 4px solid #6366f1; background-color: #f3f4f6;">` +
          `<p><strong>Event:</strong> ${eventName}</p>` +
          `<p><strong>Date:</strong> ${formattedDate}</p>` +
          `<p><strong>Time:</strong> ${time}</p>` +
          `<p><strong>Venue:</strong> ${venue}</p>` +
          `<p><strong>Speaker:</strong> ${speaker}</p>` +
          `</div>` +
          `<p><strong>Description:</strong><br>${description}</p>` +
          `<p>You can register for this event through the <a href="https://ccd-training-skilling.vercel.app/">Training and Skilling Portal</a>.</p>` +
          `<p>Regards,<br>` +
          `Career & Competency Development Cell<br>` +
          `IIT Guwahati</p>` +
          `</div>`;

        await exports.sendEmail({
          to: user.email,
          subject: emailSubject,
          text: emailText,
          html: emailHtml
        });
        
        successCount++;
      } catch (err) {
        console.error(`Failed to send email to ${user.email}:`, err);
        errorCount++;
      }
    }
    
    console.log(`Email notification summary: ${successCount} sent successfully, ${errorCount} failed`);
    return { successCount, errorCount };
  } catch (error) {
    console.error('Failed to send notification emails:', error);
    throw new Error(`Failed to send notification emails: ${error.message}`);
  }
};

/**
 * Send event update notifications to registered users
 * @param {Object} eventDetails - Event information
 * @param {Array} users - List of user objects with email property
 * @param {String} subject - Email subject
 * @param {String} message - Custom update message
 * @returns {Promise} - Promise that resolves when all emails are sent
 */
exports.sendEventUpdateEmails = async (eventDetails, users, subject, message) => {
  try {
    console.log(`Preparing to send update notifications to ${users.length} users`);
    
    // Get frontend URL from environment variables with fallback to production URL
    const FRONTEND_URL = process.env.FRONTEND_URL || process.env.PROD_FRONTEND_URL || 'https://ccd-training-skilling.vercel.app';
    
    const { eventName, date, time, venue } = eventDetails;
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let successCount = 0;
    let errorCount = 0;
    
    // Send emails to each user
    for (const user of users) {
      try {
        const emailText = 
          `Hello ${user.fullName || 'Student'},\n\n` +
          `Important update regarding the event "${eventName}":\n\n` +
          `${message}\n\n` +
          `Event details:\n` +
          `Date: ${formattedDate}\n` +
          `Time: ${time}\n` +
          `Venue: ${venue}\n\n` +
          `For more information, please log in to the Training and Skilling Portal at ${FRONTEND_URL}\n\n` +
          `Regards,\n` +
          `Career & Competency Development Cell\n` +
          `IIT Guwahati`;

        const emailHtml = 
          `<div style="font-family: Arial, sans-serif; line-height: 1.6;">` +
          `<p>Hello ${user.fullName || 'Student'},</p>` +
          `<p>Important update regarding the event <strong>${eventName}</strong>:</p>` +
          `<div style="margin: 20px 0; padding: 15px; border-left: 4px solid #6366f1; background-color: #f3f4f6;">` +
          `${message.replace(/\n/g, '<br>')}` +
          `</div>` +
          `<div style="margin-top: 20px;">` +
          `<p><strong>Event details:</strong></p>` +
          `<p>Date: ${formattedDate}<br>` +
          `Time: ${time}<br>` +
          `Venue: ${venue}</p>` +
          `</div>` +
          `<p>For more information, please log in to the <a href="https://ccd-training-skilling.vercel.app/">Training and Skilling Portal</a>.</p>` +
          `<p>Regards,<br>` +
          `Career & Competency Development Cell<br>` +
          `IIT Guwahati</p>` +
          `</div>`;

        await exports.sendEmail({
          to: user.email,
          subject: subject || `Update for event: ${eventName}`,
          text: emailText,
          html: emailHtml
        });
        
        successCount++;
      } catch (err) {
        console.error(`Failed to send update email to ${user.email}:`, err);
        errorCount++;
      }
    }
    
    console.log(`Email update notification summary: ${successCount} sent successfully, ${errorCount} failed`);
    return { successCount, errorCount };
  } catch (error) {
    console.error('Failed to send update notification emails:', error);
    throw new Error(`Failed to send update notification emails: ${error.message}`);
  }
};
