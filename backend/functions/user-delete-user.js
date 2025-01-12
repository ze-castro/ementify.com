import { MongoClient, ObjectId } from 'mongodb';
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
    const menusCollection = database.collection('menus');

    // Decode the token and get the user's id
    const decodedToken = verify(token, jwtSecret);
    const email = decodedToken.email;

    // Get the user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ Something went wrong getting the user.' }),
      };
    }

    // Delete the user menus
    const resultMenus = await menusCollection.deleteMany({ user: user._id });
    if (resultMenus.deletedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ Menus not found.' }),
      };
    }

    // Delete the user
    const result = await usersCollection.deleteOne({ _id: user._id });
    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ User not found.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "😢 We're sorry to see you go. Your account has been deleted.",
      }),
    };
  } catch (error) {
    console.error('Error deleting the user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '⚠️ An error occurred while deleting the user.',
      }),
    };
  } finally {
    await client.close();
  }
}
