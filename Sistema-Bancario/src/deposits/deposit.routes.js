'use strict';
import { Router } from 'express';
import {
    createDeposit,
    getDeposits,
    updateDeposit,
    revertDeposit
} from './deposit.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// POST /api/v1/admin/deposits  – Crear depósito
router.post(
    '/',
    verifyToken,
    isAdmin,
    [
        body('numeroCuenta').notEmpty().withMessage('El número de cuenta es requerido'),
        body('tipoCuenta').isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta inválido'),
        body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0'),
        body('descripcion').optional().trim()
    ],
    handleValidationErrors,
    createDeposit
);

// GET /api/v1/admin/deposits  – Listar depósitos
router.get(
    '/',
    verifyToken,
    isAdmin,
    [
        query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser mayor que 0'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
        query('revertido').optional().isBoolean().withMessage('El filtro revertido debe ser true o false')
    ],
    handleValidationErrors,
    getDeposits
);

// PUT /api/v1/admin/deposits/:id  – Modificar monto de depósito
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [
        param('id').isMongoId().withMessage('ID de depósito inválido'),
        body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0')
    ],
    handleValidationErrors,
    updateDeposit
);

// POST /api/v1/admin/deposits/:id/revert  – Revertir depósito (ventana de 1 min)
router.post(
    '/:id/revert',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID de depósito inválido')],
    handleValidationErrors,
    revertDeposit
);

export default router;