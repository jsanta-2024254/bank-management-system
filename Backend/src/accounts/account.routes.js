'use strict';
import { Router } from 'express';
import { getBalance, getTopMovements, getMyAccounts } from './account.controller.js';
import { verifyToken, isAdmin, isCliente } from '../../middlewares/auth.middleware.js';
import { param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

/**
 * @swagger
 * /accounts/top-movements:
 *   get:
 *     tags: [Accounts]
 *     summary: Obtiene las cuentas con más movimientos
 *     description: Retorna las cuentas ordenadas por número de transacciones. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de los resultados
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad máxima de resultados
 *     responses:
 *       200:
 *         description: Lista de cuentas con más movimientos
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get(
    '/top-movements',
    verifyToken,
    isAdmin,
    [
        query('order').optional().isIn(['asc', 'desc']).withMessage('El orden debe ser asc o desc'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
    ],
    handleValidationErrors,
    getTopMovements
);

/**
 * @swagger
 * /accounts/my-accounts:
 *   get:
 *     tags: [Accounts]
 *     summary: Obtiene las cuentas del cliente autenticado
 *     description: Retorna todas las cuentas bancarias asociadas al cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas del cliente
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
 */
router.get(
    '/my-accounts',
    verifyToken,
    isCliente,
    getMyAccounts
);

/**
 * @swagger
 * /accounts/{id}/balance:
 *   get:
 *     tags: [Accounts]
 *     summary: Obtiene el balance de una cuenta
 *     description: Retorna el saldo actual de una cuenta. El cliente solo puede consultar sus propias cuentas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Balance de la cuenta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numeroCuenta:
 *                   type: string
 *                 tipoCuenta:
 *                   type: string
 *                   enum: [monetaria, ahorro]
 *                 saldo:
 *                   type: number
 *                   example: 1500.00
 *       400:
 *         description: ID de cuenta inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       404:
 *         description: Cuenta no encontrada
 */
router.get(
    '/:id/balance',
    verifyToken,
    [param('id').isMongoId().withMessage('ID de cuenta inválido')],
    handleValidationErrors,
    getBalance
);

export default router;