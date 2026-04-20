'use strict';
import { Router } from 'express';
import { getAccountHistory, getTransactionById, transfer } from './transaction.controller.js';
import { verifyToken, isCliente } from '../../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

/**
 * @swagger
 * /transactions/account/{accountId}:
 *   get:
 *     tags: [Transactions]
 *     summary: Obtiene el historial de una cuenta
 *     description: Retorna todas las transacciones asociadas a una cuenta bancaria.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Historial de transacciones
 *       400:
 *         description: ID de cuenta inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       404:
 *         description: Cuenta no encontrada
 */
router.get(
    '/account/:accountId',
    verifyToken,
    [param('accountId').isMongoId().withMessage('ID de cuenta invalido')],
    handleValidationErrors,
    getAccountHistory
);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Obtiene una transacción por ID
 *     description: Retorna el detalle de una transacción específica.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Detalle de la transacción
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       404:
 *         description: Transacción no encontrada
 */
router.get(
    '/:id',
    verifyToken,
    [param('id').isMongoId().withMessage('ID de transaccion invalido')],
    handleValidationErrors,
    getTransactionById
);

/**
 * @swagger
 * /transactions/transfer:
 *   post:
 *     tags: [Transactions]
 *     summary: Realiza una transferencia
 *     description: Transfiere dinero de la cuenta del cliente autenticado a otra cuenta. Monto máximo Q2,000.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroCuentaDestino
 *               - tipoCuentaDestino
 *               - monto
 *             properties:
 *               numeroCuentaDestino:
 *                 type: string
 *                 description: Número de cuenta destino
 *               tipoCuentaDestino:
 *                 type: string
 *                 enum: [monetaria, ahorro]
 *                 description: Tipo de cuenta destino
 *               tipoCuentaOrigen:
 *                 type: string
 *                 enum: [monetaria, ahorro]
 *                 description: Tipo de cuenta origen (opcional)
 *               monto:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 2000
 *                 example: 300.00
 *                 description: Monto a transferir (entre Q0.01 y Q2,000)
 *               descripcion:
 *                 type: string
 *                 description: Descripción opcional de la transferencia
 *     responses:
 *       200:
 *         description: Transferencia realizada exitosamente
 *       400:
 *         description: Parámetros inválidos o saldo insuficiente
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
 *       404:
 *         description: Cuenta destino no encontrada
 */
router.post(
    '/transfer',
    verifyToken,
    isCliente,
    [
        body('numeroCuentaDestino').notEmpty().withMessage('El numero de cuenta destino es requerido'),
        body('tipoCuentaDestino').isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta destino invalido'),
        body('tipoCuentaOrigen').optional().isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta origen invalido'),
        body('monto').isFloat({ min: 0.01, max: 2000 }).withMessage('El monto debe estar entre Q0.01 y Q2,000'),
        body('descripcion').optional().trim()
    ],
    handleValidationErrors,
    transfer
);

export default router;