require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST route to receive form data and send email
app.post('/send-email', (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Please fill all fields' });
  }

  // Create transporter object using SMTP (example uses Gmail)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,      // Your Gmail address
      pass: process.env.EMAIL_PASS    // Gmail App Password (not your normal password)
    }
  });

  // Email options
  let mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // Your email to receive messages
    subject: `New inquiry from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Message: ${message}
    `
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email sending error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    } 
    console.log('Email sent: ' + info.response);
    res.json({ message: 'Email sent successfully!' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});