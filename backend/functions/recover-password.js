const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const rateLimiter = require('../utils/rateLimiter');

function recoverPasswordEmail(user, passwordResetToken) {
  return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 10px 0;
            background-color: #4CAF50;
            color: white;
            font-size: 24px;
            font-weight: bold;
            border-radius: 8px 8px 8px 8px;
        }
        .content {
            margin: 20px 0;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">Password Recovery</div>
        <div class="content">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>You requested to recover your password. Please click on the button below to reset your password:</p>
            <p>
                <a href="https://ementify.com/change-password?token=${passwordResetToken}" class="button">
                    Reset Your Password
                </a>
            </p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Thank you,<br>The Ementify Team</p>
        </div>
        <div class="footer">
            &copy; 2025 Ementify. All rights reserved.
        </div>
    </div>
</body>
</html>
`;
}

// MongoDB URI and JWT Secret from environment variables
const uri = process.env.MONGO_DB;
const client = new MongoClient(uri);
const jwtSecret = process.env.JWT_SECRET;

// Rate limiter
const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000,
  maxRequests: 10,
});

exports.handler = async (event, context) => {
  // Apply rate limiting
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  if (!limiter(ip)) {
    return limiter.handler();
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed 🚫' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    // Connect to MongoDB
    await client.connect();
    const database = client.db('ementify');
    const usersCollection = database.collection('users');

    // Check if the user exists
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'The email you entered does not belong to an account.' }),
      };
    }

    // Create a JWT token with the user's email
    const passwordResetToken = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create the email message
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Ementify | Password Recovery',
      html: recoverPasswordEmail(user, passwordResetToken),
    };

    // Save the token in the user's document
    const updateUser = await usersCollection.updateOne({ email }, { $set: { passwordResetToken } });
    if (!updateUser) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to send the email. Try again later.' }),
      };
    }

    // Send an email to the user with the password reset link
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Email sent successfully. Check your inbox.' }),
      };
    } catch (error) {
      console.error('Error sending email:', error);

      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email', details: error.message }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'An error occurred during login.' }),
    };
  } finally {
    await client.close();
  }
};
