'use strict';
import { Router } from 'express';
import { convertCurrency } from './currency.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

/**
 * @swagger
 * /currency/convert:
 *   get:
 *     tags: [Currency]
 *     summary: Convierte un monto entre divisas
 *     description: Convierte un monto de una moneda a otra usando tasas de cambio en tiempo real. Por defecto convierte desde GTQ.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           example: USD
 *         description: Moneda destino (ej. USD, EUR, MXN)
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           default: GTQ
 *           example: GTQ
 *         description: Moneda origen (por defecto GTQ)
 *       - in: query
 *         name: amount
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0.01
 *           default: 1
 *           example: 500
 *         description: Monto a convertir (por defecto 1)
 *     responses:
 *       200:
 *         description: Conversión exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from:
 *                   type: string
 *                   example: GTQ
 *                 to:
 *                   type: string
 *                   example: USD
 *                 amount:
 *                   type: number
 *                   example: 500
 *                 result:
 *                   type: number
 *                   example: 64.85
 *                 rate:
 *                   type: number
 *                   example: 0.1297
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 */
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