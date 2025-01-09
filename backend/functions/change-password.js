import { MongoClient } from 'mongodb';
import { hash } from 'bcrypt';
import { verify } from 'jsonwebtoken';
require('dotenv').config();
import rateLimiter from '../utils/rateLimiter.js';

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
    const { token, password } = JSON.parse(event.body);

    // Connect to MongoDB
    await client.connect();
    const database = client.db('ementify');
    const usersCollection = database.collection('users');

    // Decode the token and get the user's email
    const decodedToken = verify(token, jwtSecret);
    const email = decodedToken.email;

    // Check if the user exists
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'The token is invalid. The user does not exist.' }),
      };
    }

    // Password token and time
    const passwordResetToken = user.passwordResetToken;
    const passwordResetTime = decodedToken.exp;

    // Check if the token is valid
    if (passwordResetToken !== token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'The token is invalid.' }),
      };
    }

    // Check if the token has expired
    if (Date.now() > passwordResetTime * 1000) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'The token has expired.' }),
      };
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update the user's password
    const updatedPassword = await usersCollection.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
    if (updatedPassword.modifiedCount === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'An error occurred during password update.' }),
      };
    }

    // Return a success message
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Password updated successfully.' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'An error occurred during login.' }),
    };
  } finally {
    await client.close();
  }
}
