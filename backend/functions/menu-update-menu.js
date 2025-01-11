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
    const { token, menu } = JSON.parse(event.body);
    
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
    
    // Create an ObjectId from the menu id
    const objectMenuId = new ObjectId(menu._id);
    const objectUserId = new ObjectId(user._id);

    // Update the menu
    const menuResponse = await menusCollection.updateOne(
      { _id: objectMenuId, user: objectUserId },
      {
        $set: {
          title: menu.title,
          categories: menu.categories,
        },
      }
    );
    if (menuResponse.modifiedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ Menu not found.' }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: '✅ Menu updated successfully.' }),
    };
  } catch (error) {
    console.error('Error updating the menu:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '⚠️ An error occurred while updating the menu.',
      }),
    };
  } finally {
    await client.close();
  }
}
