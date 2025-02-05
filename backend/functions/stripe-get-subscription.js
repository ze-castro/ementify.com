import dotenv from 'dotenv';
if (process.env.NODE_ENV == 'dev') {
  dotenv.config();
}
import rateLimiter from '../utils/rateLimiter';
import Stripe from 'stripe';
import connectToDatabase from '../utils/dbConnection';

// Stripe Key from environment variables
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

  // Get the user data from the request body
  const { customerId } = JSON.parse(event.body);

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Get the user from the database
    const user = await usersCollection.findOne({ stripeId: customerId });
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ User not found.' }),
      };
    }

    // Get the subscription from Stripe customer ID
    const subscription = await stripe.subscriptions.list({
      customer: customerId,
    });

    const subscriptionData = subscription.data[0];
    if (!subscriptionData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: '⚠️ Subscription not found.' }),
      };
    }

    const newSubscription = {
      id: subscriptionData.id,
      status: subscriptionData.status,
      current_period_end: subscriptionData.current_period_end,
      current_period_start: subscriptionData.current_period_start,
      price_id: subscriptionData.items.data[0].price.id,
      cancel_at: subscriptionData.cancel_at,
    };

    const dateEnd = subscriptionData.current_period_end;
    const dateNow = new Date().getTime() / 1000;

    // Update the user in the database
    const updatedUser = await usersCollection.findOneAndUpdate(
      { stripeId: customerId },
      {
        $set: {
          paid: dateEnd >= dateNow && subscriptionData.status !== 'canceled' ? true : false,
          subscription: newSubscription,
        },
      },
      { returnDocument: 'after' }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '🎉 Congratulations! You are a Pro Member.',
        user: updatedUser,
      }),
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '⚠️ An error occurred getting subscription.',
      }),
    };
  }
}
