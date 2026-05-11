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

const MODOS_SINCRONIZACION_PERMITIDOS = ['none', 'sync', 'alter'];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const obtenerModoSincronizacion = () => {
  const modo = String(process.env.DB_SYNC_MODE || 'none').toLowerCase().trim();

  if (!MODOS_SINCRONIZACION_PERMITIDOS.includes(modo)) {
    console.warn(
      `PostgreSQL | DB_SYNC_MODE "${modo}" no es valido. Se usara "none".`
    );

    return 'none';
  }

  return modo;
};

const sincronizarModelos = async () => {
  const modoSincronizacion = obtenerModoSincronizacion();
  const syncLogging = process.env.DB_SQL_LOGGING === 'true' ? console.log : false;

  if (modoSincronizacion === 'none') {
    console.log('PostgreSQL | Model synchronization skipped. DB_SYNC_MODE=none');
    return;
  }

  if (modoSincronizacion === 'alter' && process.env.DB_ALLOW_ALTER_SYNC !== 'true') {
    throw new Error(
      'DB_SYNC_MODE=alter requiere DB_ALLOW_ALTER_SYNC=true. Use migrations o DB_SYNC_MODE=sync para desarrollo inicial.'
    );
  }

  const syncOptions = {
    logging: syncLogging,
  };

  if (modoSincronizacion === 'alter') {
    syncOptions.alter = true;
  }

  await sequelize.sync(syncOptions);

  console.log(`PostgreSQL | Models synchronized with database. DB_SYNC_MODE=${modoSincronizacion}`);
};

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

      await sincronizarModelos();

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