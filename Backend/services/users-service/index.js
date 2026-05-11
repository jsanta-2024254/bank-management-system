import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { dbConnection } from './configs/db.js';
import { corsOptions } from './configs/cors-configuration.js';
import { helmetConfiguration } from './configs/helmet-configuration.js';

import './src/users/user-model.js';
import './src/users/clientProfile.model.js';
import './src/auth/role.model.js';

import userRoutes from './src/users/user-routes.js';
import meRoutes from './src/users/me.routes.js';
import adminUserRoutes from './src/users/adminUser-routes.js';

import {
  errorHandler,
  notFound,
} from './middlewares/server-genericError-handler.js';
import { requestLimit } from './middlewares/request-limit.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3002;
const SERVICE_NAME = process.env.SERVICE_NAME || 'users-service';
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

app.use(`${BASE_PATH}/users`, userRoutes);
app.use(`${BASE_PATH}/me`, meRoutes);
app.use(`${BASE_PATH}/admin/users`, adminUserRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await dbConnection();

    const { seedRoles } = await import('./helpers/role-seed.js');
    await seedRoles();
    console.log('UsersService | Roles seeded');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`${SERVICE_NAME} running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}${BASE_PATH}/health`);
      console.log(`Users: http://localhost:${PORT}${BASE_PATH}/users`);
      console.log(`Me: http://localhost:${PORT}${BASE_PATH}/me`);
      console.log(
        `Admin users: http://localhost:${PORT}${BASE_PATH}/admin/users`
      );
    });
  } catch (error) {
    console.error(`Error starting ${SERVICE_NAME}:`, error.message);
    process.exit(1);
  }
};

startServer();