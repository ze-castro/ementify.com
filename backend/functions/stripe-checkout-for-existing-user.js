import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';
import dotenv from 'dotenv';
if (process.env.NODE_ENV == 'dev') {
  dotenv.config();
}
import rateLimiter from '../utils/rateLimiter';
import Stripe from 'stripe';

// MongoDB URI, JWT Secret and Stripe Key from environment variables
const jwtSecret = process.env.JWT_SECRET;
const uri = process.env.MONGO_DB;
const client = new MongoClient(uri);
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
  const { token } = JSON.parse(event.body);

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db('ementify');
    const usersCollection = database.collection('users');

    // Decode the token and get the user's id
    const decodedToken = verify(token, jwtSecret);
    const email = decodedToken.email;
    const name = decodedToken.name;

    // Check if the user exists
    const user = await usersCollection.findOne({ email });
    if (user) {
      // Check if stripe customer exists
      let customer = await stripe.customers.list({ email });
      if (customer.data.length > 0) {
        customer = customer.data[0];
      } else {
        // Create a new Stripe Customer
        customer = await stripe.customers.create({
          email: email,
          name: name,
        });
      }

      // Update the user with the Stripe Customer ID
      await usersCollection.findOneAndUpdate(
        { email },
        { $set: { stripeId: customer.id } },
        { returnDocument: 'after' }
      );

      // Create a new Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: 'price_1QoXuDL5Ad6XODbG0nfyDFh9',
            quantity: 1,
          },
        ],
        success_url: 'https://ementify.com/app/profile',
        cancel_url: 'https://ementify.com/app/profile',
      });

      // Respond with success and token
      return {
        statusCode: 201,
        body: JSON.stringify({ sessionId: session.id, customerId: customer.id }),
      };
    } else {
      // If the user is not found
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: '⚠️ User not found. Refresh the page and try again.',
        }),
      };
    }
  } catch (error) {
    console.error('Error creating the checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '⚠️ An error occurred creating the checkout session.',
      }),
    };
  } finally {
    await client.close();
  }
}
