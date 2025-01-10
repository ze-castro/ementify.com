import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';
import dotenv from 'dotenv';
if (process.env.NODE_ENV == 'dev') {
  dotenv.config();
}
import rateLimiter from '../utils/rateLimiter';

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
    const { token } = JSON.parse(event.body);

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
        body: JSON.stringify({ message: '⚠️ Something went wrong. Please log in again.' }),
      };
    }

    // Check is token is expired
    const tokenExpired = decodedToken.exp;
    if (Date.now() > tokenExpired * 1000) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: '🕒 The token has expired. Please log in again.' }),
      };
    }

    // Return a successful response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: '✅ Token verified.' }),
    };
  } catch (error) {
    console.error('Error getting the user data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '⚠️ An error occurred getting the user data. Please log in again.' }),
    };
  } finally {
    await client.close();
  }
}
