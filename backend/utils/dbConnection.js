import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
if (process.env.NODE_ENV == 'dev') {
  dotenv.config();
}

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(process.env.MONGO_DB, {
    maxPoolSize: 10,
    maxIdleTimeMS: 120000,
  });

  const db = client.db('ementify');
  cachedClient = client;
  cachedDb = db;

  console.log('Connected to MongoDB');
  return { client, db };
}

export default connectToDatabase;
