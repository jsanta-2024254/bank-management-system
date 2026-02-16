'use strict';
import { Router } from 'express';
import { convertCurrency } from './currency.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// GET /api/currency/convert?from=GTQ&to=USD&amount=500
router.get(
    '/convert',
    verifyToken,
    [
        query('to').notEmpty().withMessage('El parametro "to" es requerido (ej: USD, EUR, MXN)'),
        query('from').optional().notEmpty().withMessage('El parametro "from" no puede estar vacio'),
        query('amount').optional().isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0')
    ],
    handleValidationErrors,
    convertCurrency
);

export default router;
