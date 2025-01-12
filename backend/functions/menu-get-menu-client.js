import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
if (process.env.NODE_ENV == 'dev') {
  dotenv.config();
}
import rateLimiter from '../utils/rateLimiter';

// MongoDB URI and JWT Secret from environment variables
const uri = process.env.MONGO_DB;
const client = new MongoClient(uri);

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
    await client.connect();
    const database = client.db('ementify');
    const menusCollection = database.collection('menus');
    console.log('Connected to MongoDB', menusCollection);

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
  } finally {
    await client.close();
  }
}
