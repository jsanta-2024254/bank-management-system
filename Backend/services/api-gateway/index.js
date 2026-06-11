import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const BASE_PATH = '/api/v1';

const obtenerUrlServicio = (variableEntorno, urlFallback) => {
  return (process.env[variableEntorno] || urlFallback).replace(/\/$/, '');
};

const servicios = {
  auth: obtenerUrlServicio('AUTH_SERVICE_URL', 'http://localhost:3001'),
  users: obtenerUrlServicio('USERS_SERVICE_URL', 'http://localhost:3002'),
  accounts: obtenerUrlServicio('ACCOUNTS_SERVICE_URL', 'http://localhost:3003'),
  transactions: obtenerUrlServicio(
    'TRANSACTIONS_SERVICE_URL',
    'http://localhost:3004'
  ),
  finance: obtenerUrlServicio('FINANCE_SERVICE_URL', 'http://localhost:3005'),
  products: obtenerUrlServicio('PRODUCTS_SERVICE_URL', 'http://localhost:3006'),
};

const responderErrorProxy = (nombreServicio) => {
  return (err, req, res) => {
    console.error(
      `[API Gateway] Error conectando con ${nombreServicio}: ${err.code || err.message}`
    );

    if (res.headersSent) {
      return;
    }

    const statusCode =
      err.code === 'ECONNREFUSED' ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ECONNRESET'
        ? 502
        : 504;

    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
    });

    res.end(
      JSON.stringify({
        success: false,
        message: `No se pudo conectar con ${nombreServicio}`,
        service: nombreServicio,
        error: err.code || err.message,
      })
    );
  };
};

const crearProxy = ({ nombreServicio, target }) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: 15000,
    proxyTimeout: 15000,
    on: {
      error: responderErrorProxy(nombreServicio),
    },
  });
};

app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(morgan('dev'));

app.get(`${BASE_PATH}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    service: 'api-gateway',
    status: 'Healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use(
  `${BASE_PATH}/auth`,
  crearProxy({
    nombreServicio: 'auth-service',
    target: `${servicios.auth}${BASE_PATH}/auth`,
  })
);

app.use(
  `${BASE_PATH}/admin/users`,
  crearProxy({
    nombreServicio: 'users-service',
    target: `${servicios.users}${BASE_PATH}/admin/users`,
  })
);

app.use(
  `${BASE_PATH}/users`,
  crearProxy({
    nombreServicio: 'users-service',
    target: `${servicios.users}${BASE_PATH}/users`,
  })
);

app.use(
  `${BASE_PATH}/me`,
  crearProxy({
    nombreServicio: 'users-service',
    target: `${servicios.users}${BASE_PATH}/me`,
  })
);

app.use(
  `${BASE_PATH}/accounts`,
  crearProxy({
    nombreServicio: 'accounts-service',
    target: `${servicios.accounts}${BASE_PATH}/accounts`,
  })
);

app.use(
  `${BASE_PATH}/internal/accounts`,
  crearProxy({
    nombreServicio: 'accounts-service',
    target: `${servicios.accounts}${BASE_PATH}/internal/accounts`,
  })
);

app.use(
  `${BASE_PATH}/transactions`,
  crearProxy({
    nombreServicio: 'transactions-service',
    target: `${servicios.transactions}${BASE_PATH}/transactions`,
  })
);

app.use(
  `${BASE_PATH}/deposit-requests`,
  crearProxy({
    nombreServicio: 'finance-service',
    target: `${servicios.finance}${BASE_PATH}/deposit-requests`,
  })
);

app.use(
  `${BASE_PATH}/deposits`,
  crearProxy({
    nombreServicio: 'finance-service',
    target: `${servicios.finance}${BASE_PATH}/admin/deposits`,
  })
);

app.use(
  `${BASE_PATH}/currency`,
  crearProxy({
    nombreServicio: 'finance-service',
    target: `${servicios.finance}${BASE_PATH}/currency`,
  })
);

app.use(
  `${BASE_PATH}/favorites`,
  crearProxy({
    nombreServicio: 'finance-service',
    target: `${servicios.finance}${BASE_PATH}/favorites`,
  })
);

app.use(
  `${BASE_PATH}/products`,
  crearProxy({
    nombreServicio: 'products-service',
    target: `${servicios.products}${BASE_PATH}/products`,
  })
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada en API Gateway',
    path: req.originalUrl,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway funcionando en http://localhost:${PORT}${BASE_PATH}`);
  console.log(`Auth service: ${servicios.auth}`);
  console.log(`Users service: ${servicios.users}`);
  console.log(`Accounts service: ${servicios.accounts}`);
  console.log(`Transactions service: ${servicios.transactions}`);
  console.log(`Finance service: ${servicios.finance}`);
  console.log(`Products service: ${servicios.products}`);
});