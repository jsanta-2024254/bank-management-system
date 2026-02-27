'use strict';
import { Router } from 'express';
import { getAccountHistory, getTransactionById, transfer } from './transaction.controller.js';
import { verifyToken, isCliente } from '../../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// GET /api/transactions/account/:accountId
router.get(
    '/account/:accountId',
    verifyToken,
    [param('accountId').isMongoId().withMessage('ID de cuenta invalido')],
    handleValidationErrors,
    getAccountHistory
);

// GET /api/transactions/:id
router.get(
    '/:id',
    verifyToken,
    [param('id').isMongoId().withMessage('ID de transaccion invalido')],
    handleValidationErrors,
    getTransactionById
);

// POST /api/transactions/transfer
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