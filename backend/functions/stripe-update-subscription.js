import { verify } from 'jsonwebtoken';
import dotenv from 'dotenv';
if (process.env.NODE_ENV == 'dev') {
  dotenv.config();
}
import rateLimiter from '../utils/rateLimiter';
import Stripe from 'stripe';
import connectToDatabase from '../utils/dbConnection';

// MongoDB URI, JWT Secret and Stripe Key from environment variables
const jwtSecret = process.env.JWT_SECRET;
const stripe = new Stripe(process.env.STRIPE);

// Rate limiter
const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000,
  maxRequests: 10,
});

export async function handler(event) {
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

  // Get the data from the request body
  const { subscriptionId, token } = JSON.parse(event.body);

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Decode the token and get the user's email
    const decodedToken = verify(token, jwtSecret);
    const email = decodedToken.email;

    // Get the user from the database
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ User not found.' }),
      };
    }

    // Get the subscription from Stripe customer ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ Subscription not found.' }),
      };
    }

    const newSubscription = {
      id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      price_id: subscription.items.data[0].price.id,
      cancel_at: subscription.cancel_at,
    };

    const dateEnd = subscription.current_period_end;
    const dateNow = new Date().getTime() / 1000;

    // Update the user in the database
    const updatedUser = await usersCollection.findOneAndUpdate(
      { email },
      {
        $set: {
          paid: dateEnd >= dateNow && subscription.status !== 'canceled' ? true : false,
          subscription: newSubscription,
        },
      },
      { returnDocument: 'after' }
    );

    // Return the response and the user data
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ Subscription updated successfully.',
        user: updatedUser,
      }),
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '⚠️ An error occurred updating subscription.',
      }),
    };
  }
}
