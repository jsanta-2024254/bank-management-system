import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDB } from './configs/db-mongo.js';
import { corsOptions } from './configs/cors-configuration.js';
import { helmetConfiguration } from './configs/helmet-configuration.js';

import './src/accounts/account.model.js';
import './src/transactions/transaction.model.js';
import './src/deposits/dailyLimit.model.js';
import './src/deposits/deposit.model.js';
import './src/favorites/favorite.model.js';

import depositRoutes from './src/deposits/deposit.routes.js';
import favoriteRoutes from './src/favorites/favorite.router.js';
import currencyRoutes from './src/currency/currency.routes.js';

import {
  errorHandler,
  notFound,
} from './middlewares/server-genericError-handler.js';
import { requestLimit } from './middlewares/request-limit.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3005;
const SERVICE_NAME = process.env.SERVICE_NAME || 'finance-service';
const BASE_PATH = '/api/v1';

app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));
app.use(helmet(helmetConfiguration));
app.use(requestLimit);
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.get(`${BASE_PATH}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Healthy',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  });
});

app.use(`${BASE_PATH}/deposits`, depositRoutes);
app.use(`${BASE_PATH}/admin/deposits`, depositRoutes);
app.use(`${BASE_PATH}/favorites`, favoriteRoutes);
app.use(`${BASE_PATH}/currency`, currencyRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`${SERVICE_NAME} running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}${BASE_PATH}/health`);
      console.log(
        `Deposits: http://localhost:${PORT}${BASE_PATH}/admin/deposits`
      );
      console.log(`Favorites: http://localhost:${PORT}${BASE_PATH}/favorites`);
      console.log(`Currency: http://localhost:${PORT}${BASE_PATH}/currency`);
    });
  } catch (error) {
    console.error(`Error starting ${SERVICE_NAME}:`, error.message);
    process.exit(1);
  }
};

startServer();