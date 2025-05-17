import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';
if (process.env.NODE_ENV == 'dev') {
  dotenv.config();
}
import rateLimiter from '../utils/rateLimiter';
import connectToDatabase from '../utils/dbConnection';

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
    const { menuId } = JSON.parse(event.body);

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const menusCollection = db.collection('menus');
    const usersCollection = db.collection('users');

    // Transform the menuId to an ObjectId
    const menu_id = new ObjectId(menuId);

    // Find all the menus with id
    const menu = await menusCollection.findOne({ _id: menu_id });
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
  }
}
