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
    const { token, title } = JSON.parse(event.body);

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

    // Create a new menu
    const newMenu = {
      title,
      user: user._id,
      categories: [
        {
          name: 'Appetizer',
          items: [
            {
              title: 'Bruschetta',
              description: 'Grilled bread topped with tomato, garlic, and olive oil.',
              price: 5.0,
            },
            {
              title: 'Spring Rolls',
              description: 'Crispy rolls filled with vegetables and served with dipping sauce.',
              price: 6.5,
            },
          ],
        },
        {
          name: 'Main Course',
          items: [
            {
              title: 'Grilled Salmon',
              description: 'Served with a side of roasted vegetables and lemon butter sauce.',
              price: 18.5,
            },
            {
              title: 'Chicken Alfredo',
              description: 'Creamy pasta with grilled chicken and Parmesan cheese.',
              price: 15.0,
            },
          ],
        },
        {
          name: 'Dessert',
          items: [
            {
              title: 'Chocolate Cake',
              description: 'Rich and moist chocolate cake with a dark chocolate glaze.',
              price: 7.0,
            },
            {
              title: 'Tiramisu',
              description:
                'Classic Italian dessert made with mascarpone and coffee-soaked ladyfingers.',
              price: 8.0,
            },
          ],
        },
        {
          name: 'Drinks',
          items: [
            {
              title: 'Fresh Lemonade',
              description: 'Homemade lemonade with fresh lemon juice and mint.',
              price: 3.5,
            },
            {
              title: 'Red Wine',
              description: 'A glass of premium red wine from the finest vineyards.',
              price: 10.0,
            },
          ],
        },
      ],
      createdAt: new Date(),
    };

    // Insert the menu
    const menu = await menusCollection.insertOne(newMenu);
    if (!menu) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: '⚠️ An error occurred creating the menu.' }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: '🍔 Menu created successfully.', id: menu.insertedId }),
    };
  } catch (error) {
    console.error('Error creating the menu:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '⚠️ An error occurred creating the menu.',
      }),
    };
  } finally {
    await client.close();
  }
}
