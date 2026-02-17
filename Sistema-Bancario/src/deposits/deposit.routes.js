'use strict';
import { Router } from 'express';
import { createDeposit, getDeposits, updateDeposit, revertDeposit } from './deposit.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// POST /api/admin/deposits
router.post(
    '/',
    verifyToken,
    isAdmin,
    [
        body('numeroCuenta').notEmpty().withMessage('El numero de cuenta es requerido'),
        body('tipoCuenta').isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta invalido'),
        body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0'),
        body('descripcion').optional().trim()
    ],
    handleValidationErrors,
    createDeposit
);

// GET /api/admin/deposits
router.get(
    '/',
    verifyToken,
    isAdmin,
    getDeposits
);

// PUT /api/admin/deposits/:id
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0')
    ],
    handleValidationErrors,
    updateDeposit
);

// POST /api/admin/deposits/:id/revert
router.post(
    '/:id/revert',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    revertDeposit
);

export default router;