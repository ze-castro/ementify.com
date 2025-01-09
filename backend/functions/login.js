import { MongoClient } from 'mongodb';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
require('dotenv').config();
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
    const { email, password } = JSON.parse(event.body);

    // Connect to MongoDB
    await client.connect();
    const database = client.db('ementify');
    const usersCollection = database.collection('users');

    // Check if the user exists
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Error finding your account.' }),
      };
    }

    // Check password
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid email or password. Please try again!' }),
      };
    }

    // Generate JWT token
    const token = sign({ email: user.email, name: user.name }, jwtSecret, { expiresIn: '30d' });

    // Respond with success and token
    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
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
