import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

let mongod = null;
let client = null;
let db = null;

export const connectToDatabase = async () => {
  if (db) return db;

  try {
    // Start MongoDB Memory Server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db('financehub');
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('budgets').createIndex({ user_id: 1 });
    await db.collection('expenses').createIndex({ user_id: 1 });
    await db.collection('transactions').createIndex({ user_id: 1 });
    
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return db;
};

export const closeDatabase = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
};