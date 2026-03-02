'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { connectDB } from './db-mongo.js';
import '../src/users/user-model.js';
import '../src/users/clientProfile.model.js'; 
import '../src/auth/role.model.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';

// Rutas
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user-routes.js';
import meRoutes from '../src/users/me.routes.js';              
import favoriteRoutes from '../src/favorites/favorite.router.js';
import productRoutes from '../src/products/product.routes.js';
import currencyRoutes from '../src/currency/currency.routes.js';
import accountRoutes from '../src/accounts/account.routes.js';
import transactionRoutes from '../src/transactions/transaction.routes.js';
import depositRoutes from '../src/deposits/deposit.routes.js';
import adminUserRoutes from '../src/users/adminUser-routes.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  // Auth y perfil del sistema de auth
  app.use(`${BASE_PATH}/auth`, authRoutes);

  // Gestión de roles (sistema interno)
  app.use(`${BASE_PATH}/users`, userRoutes);

  // Perfil propio del cliente (edición autoservicio)
  app.use(`${BASE_PATH}/me`, meRoutes);

  // Administración de usuarios (solo ADMIN_ROLE)
  app.use(`${BASE_PATH}/admin/users`, adminUserRoutes);

  // Depósitos (solo ADMIN_ROLE)
  app.use(`${BASE_PATH}/admin/deposits`, depositRoutes);

  // Cuentas bancarias (balance, top-movements, my-accounts)
  app.use(`${BASE_PATH}/accounts`, accountRoutes);

  // Transacciones (historial y transferencias)
  app.use(`${BASE_PATH}/transactions`, transactionRoutes);

  // Favoritos del cliente
  app.use(`${BASE_PATH}/favorites`, favoriteRoutes);

  // Productos/servicios exclusivos
  app.use(`${BASE_PATH}/products`, productRoutes);
  app.use(`${BASE_PATH}/admin/products`, productRoutes);

  // Conversión de divisas
  app.use(`${BASE_PATH}/currency`, currencyRoutes);

  // Health check
  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Sistema Bancario – API',
    });
  });

  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT;
  app.set('trust proxy', 1);

  try {
    await dbConnection();
    await connectDB();
    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();
    const { seedAdmin } = await import('./seed.js');
    await seedAdmin();
    middlewares(app);
    routes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Sistema Bancario API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
};