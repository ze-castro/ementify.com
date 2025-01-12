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

    // Check if user is a paid user
    // if (!user.paid) {
    //   return {
    //     statusCode: 403,
    //     body: JSON.stringify({ message: '⚠️ You need to be a paid user.' }),
    //   };
    // }

    // Count how many menus the user has
    const count = await menusCollection.countDocuments({ user: user._id });
    if (count >= 1) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: '🤷‍♂️ Upgrade your plan to create more menus.' }),
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
        {
          name: 'Soup',
          items: [
            {
              title: 'Tomato Basil Soup',
              description: 'Creamy tomato soup with fresh basil and a touch of cream.',
              price: 4.5,
            },
            {
              title: 'Minestrone',
              description: 'Hearty Italian vegetable soup with beans and pasta.',
              price: 6.0,
            },
            {
              title: 'Clam Chowder',
              description: 'Rich and creamy soup with clams and potatoes.',
              price: 7.5,
            },
          ],
        },
        {
          name: 'Salads',
          items: [
            {
              title: 'Caesar Salad',
              description: 'Classic Caesar salad with romaine lettuce, croutons, and Parmesan.',
              price: 8.0,
            },
            {
              title: 'Greek Salad',
              description: 'Fresh salad with tomatoes, cucumbers, olives, and feta cheese.',
              price: 9.0,
            },
            {
              title: 'Caprese Salad',
              description: 'Sliced tomatoes and mozzarella, drizzled with balsamic glaze.',
              price: 10.0,
            },
            {
              title: 'Chicken Salad',
              description:
                'Grilled chicken on a bed of mixed greens with a honey mustard dressing.',
              price: 11.0,
            },
          ],
        },
        {
          name: 'Pasta',
          items: [
            {
              title: 'Spaghetti Carbonara',
              description: 'Classic pasta with pancetta, egg, and Parmesan cheese.',
              price: 12.0,
            },
            {
              title: 'Penne Arrabbiata',
              description: 'Pasta in a spicy tomato sauce with garlic and chili.',
              price: 10.5,
            },
            {
              title: 'Lasagna',
              description: 'Layered pasta with meat sauce, ricotta, and melted mozzarella.',
              price: 14.0,
            },
          ],
        },
        {
          name: 'Burgers',
          items: [
            {
              title: 'Classic Cheeseburger',
              description: 'Beef patty with cheese, lettuce, tomato, and pickles.',
              price: 9.5,
            },
            {
              title: 'Bacon Burger',
              description: 'Beef burger topped with crispy bacon and cheddar cheese.',
              price: 11.0,
            },
            {
              title: 'Veggie Burger',
              description: 'Grilled vegetable patty with avocado and spicy mayo.',
              price: 8.5,
            },
            {
              title: 'Mushroom Swiss Burger',
              description: 'Juicy burger topped with sautéed mushrooms and Swiss cheese.',
              price: 12.0,
            },
          ],
        },
        {
          name: 'Seafood',
          items: [
            {
              title: 'Shrimp Scampi',
              description: 'Garlic butter shrimp served over linguine pasta.',
              price: 17.0,
            },
            {
              title: 'Lobster Tail',
              description: 'Grilled lobster tail served with melted butter.',
              price: 25.0,
            },
            {
              title: 'Seafood Paella',
              description: 'Traditional Spanish rice dish with shrimp, clams, and mussels.',
              price: 22.0,
            },
            {
              title: 'Fish and Chips',
              description: 'Beer-battered fish fillets with fries and tartar sauce.',
              price: 14.0,
            },
          ],
        },
        {
          name: 'Sides',
          items: [
            {
              title: 'French Fries',
              description: 'Crispy golden fries seasoned to perfection.',
              price: 3.0,
            },
            {
              title: 'Mashed Potatoes',
              description: 'Creamy mashed potatoes with butter and herbs.',
              price: 4.0,
            },
            {
              title: 'Steamed Vegetables',
              description: 'Fresh seasonal vegetables, lightly steamed.',
              price: 4.5,
            },
            {
              title: 'Garlic Bread',
              description: 'Toasted bread with garlic butter and parsley.',
              price: 3.5,
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
