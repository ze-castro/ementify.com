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
    const { token, menuId } = JSON.parse(event.body);

    // Connect to MongoDB
    await client.connect();
    const database = client.db('ementify');
    const menusCollection = database.collection('menus');
    const usersCollection = database.collection('users');

    // Decode the token and get the user's id
    const decodedToken = verify(token, jwtSecret);
    const email = decodedToken.email;

    // Get the user's id
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ Something went wrong getting the menu owner.' }),
      };
    }

    // Transform the menuId to an ObjectId
    const menu_id = new ObjectId(menuId);

    // Find all the menus with id
    const menu = await menusCollection.findOne({ _id: menu_id, user: user._id });
    if (!menu) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ Something went wrong getting the menu.' }),
      };
    }

    // Return the menu
    return {
      statusCode: 200,
      body: JSON.stringify({ menu }),
    };
  } catch (error) {
    console.error('Error getting the menu:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '⚠️ An error occurred getting the menu.',
      }),
    };
  } finally {
    await client.close();
  }
}
