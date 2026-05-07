'use strict';

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: process.env.DB_SQL_LOGGING === 'true' ? console.log : false,
  define: {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const dbConnection = async () => {
  const maxRetries = 10;
  const retryDelayMs = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `PostgreSQL | Trying to connect... attempt ${attempt}/${maxRetries}`
      );

      await sequelize.authenticate();

      console.log('PostgreSQL | Connected to PostgreSQL');
      console.log('PostgreSQL | Connection to database established');

      if (process.env.NODE_ENV === 'development') {
        const syncLogging =
          process.env.DB_SQL_LOGGING === 'true' ? console.log : false;

        await sequelize.sync({ alter: true, logging: syncLogging });
        console.log('PostgreSQL | Models synchronized with database');
      }

      return;
    } catch (error) {
      console.error('PostgreSQL | Could not connect to PostgreSQL');
      console.error('PostgreSQL | Error:', error.message);

      if (attempt === maxRetries) {
        console.error('PostgreSQL | Max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`PostgreSQL | Retrying in ${retryDelayMs / 1000}s...`);
      await wait(retryDelayMs);
    }
  }
};

const gracefulShutdown = async (signal) => {
  console.log(
    `PostgreSQL | Received ${signal}. Closing database connection...`
  );

  try {
    await sequelize.close();
    console.log('PostgreSQL | Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error(
      'PostgreSQL | Error during graceful shutdown:',
      error.message
    );
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));