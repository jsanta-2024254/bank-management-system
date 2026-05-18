'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRoutes from './src/products/product.routes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3006;
const MONGO_URI =
    process.env.MONGO_URI ||
    `mongodb://${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}/${process.env.DB_NAME || 'SistemaBancario'}`;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
        service: 'products-service',
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use('/api/v1/products', productRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl,
    });
});

app.use((err, _req, res, _next) => {
    console.error('Products service error:', err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Error interno del products-service',
    });
});

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log('Products service connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Products service running on port ${PORT}`);
            console.log(`Health: http://localhost:${PORT}/api/v1/health`);
        });
    } catch (error) {
        console.error('Error starting products-service:', error);
        process.exit(1);
    }
};

startServer();