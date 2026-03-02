'use strict';
import { Router } from 'express';
import { getBalance, getTopMovements, getMyAccounts } from './account.controller.js';
import { verifyToken, isAdmin, isCliente } from '../../middlewares/auth.middleware.js';
import { param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// GET /api/v1/accounts/top-movements?order=asc|desc&limit=10  (solo admin)
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

// GET /api/v1/accounts/my-accounts  (cliente autenticado)
router.get(
    '/my-accounts',
    verifyToken,
    isCliente,
    getMyAccounts
);

// GET /api/v1/accounts/:id/balance  (requiere JWT; cliente solo su cuenta)
router.get(
    '/:id/balance',
    verifyToken,
    [param('id').isMongoId().withMessage('ID de cuenta inválido')],
    handleValidationErrors,
    getBalance
);

export default router;