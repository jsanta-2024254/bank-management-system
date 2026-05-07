'use strict';

import mongoose from 'mongoose';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async () => {
  const maxRetries = 10;
  const retryDelayMs = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `MongoDB | Trying to connect... attempt ${attempt}/${maxRetries}`
      );

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      const conn = await mongoose.connect(process.env.MONGO_URI, options);

      console.log(`MongoDB | Connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        console.error(`MongoDB | Connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB | Disconnected. Trying to reconnect...');
      });

      return;
    } catch (error) {
      console.error('MongoDB | Initial connection error:', error.message);

      if (attempt === maxRetries) {
        console.error('MongoDB | Max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`MongoDB | Retrying in ${retryDelayMs / 1000}s...`);
      await wait(retryDelayMs);
    }
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`MongoDB | Received ${signal}. Closing connection...`);

  try {
    await mongoose.connection.close();
    console.log('MongoDB | Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB | Error during shutdown:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));