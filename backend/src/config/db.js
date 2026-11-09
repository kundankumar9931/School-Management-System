import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (uri = env.MONGODB_URI) => {
  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });
    if (env.NODE_ENV !== 'test') {
      console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    }
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error(`[MongoDB] Disconnect error: ${error.message}`);
  }
};
