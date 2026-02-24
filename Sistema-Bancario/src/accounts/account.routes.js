'use strict';
import { Router } from 'express';
import { getBalance, getTopMovements } from './account.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();


// GET /api/accounts/top-movements  (solo admin)
router.get(
    '/top-movements',
    verifyToken,
    isAdmin,
    getTopMovements
);

// GET /api/accounts/:id/balance  (requiere JWT)
router.get(
    '/:id/balance',
    verifyToken,
    [param('id').isMongoId().withMessage('ID de cuenta invalido')],
    handleValidationErrors,
    getBalance
);

export default router;