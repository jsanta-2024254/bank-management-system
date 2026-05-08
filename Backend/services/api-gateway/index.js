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

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Proxy para el Auth Service
app.use(createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathFilter: (path) => path.startsWith(`${BASE_PATH}/auth`)
}));

// Proxy para el Users Service
app.use(createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathFilter: (path) => path.startsWith(`${BASE_PATH}/users`)
}));

// Proxy para el Accounts Service
// Proxy para el Accounts Service
app.use(createProxyMiddleware({
    target: process.env.ACCOUNTS_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathFilter: (path) => path.startsWith(`${BASE_PATH}/accounts`) || path.startsWith(`${BASE_PATH}/internal/accounts`)
}));

// Proxy para el Transactions Service
app.use(createProxyMiddleware({
    target: process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    pathFilter: (path) => path.startsWith(`${BASE_PATH}/transactions`)
}));

// Proxy para el Finance Service
app.use(createProxyMiddleware({
    target: process.env.FINANCE_SERVICE_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathFilter: (path) =>
        path.startsWith(`${BASE_PATH}/deposits`) ||
        path.startsWith(`${BASE_PATH}/currency`) ||
        path.startsWith(`${BASE_PATH}/favorites`),
    pathRewrite: (path) => {
        if (path.startsWith(`${BASE_PATH}/deposits`)) {
            return path.replace(`${BASE_PATH}/deposits`, `${BASE_PATH}/admin/deposits`);
        }
        return path;
    }
}));

// Proxy para el Products Service
app.use(createProxyMiddleware({
    target: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3006',
    changeOrigin: true,
    pathFilter: (path) => path.startsWith(`${BASE_PATH}/products`)
}));

app.listen(PORT, () => {
    console.log(`API Gateway funcionando en http://localhost:${PORT}${BASE_PATH}`);
});