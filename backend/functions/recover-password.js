import { MongoClient } from 'mongodb';
import { sign } from 'jsonwebtoken';
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
if (process.env.NODE_ENV == 'dev') {
  dotenv.config();
}
import rateLimiter from '../utils/rateLimiter';
import recoverPasswordEmail from '../utils/emails';

// MongoDB URI and JWT Secret from environment variables
const uri = process.env.MONGO_DB;
const client = new MongoClient(uri);
const jwtSecret = process.env.JWT_SECRET;

// Rate limiter
const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000,
  maxRequests: 10,
});

export async function handler(event, context) {
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
    const passwordResetToken = sign({ email }, jwtSecret, { expiresIn: '1h' });

    // Create a nodemailer transporter
    const transporter = createTransport({
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
        body: JSON.stringify({ error: 'Failed to send email' }),
      };
    }
  } catch (error) {
    console.error('Error recovering password:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred during login.' }),
    };
  } finally {
    await client.close();
  }
}
