'use strict';
import { Router } from 'express';
import {
    getFavorites, addFavorite, updateFavorite,
    deleteFavorite, transferToFavorite
} from './favorite.controller.js';
import { verifyToken, isCliente } from '../../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// GET /api/favorites
router.get(
    '/',
    verifyToken,
    isCliente,
    getFavorites
);

// POST /api/favorites
router.post(
    '/',
    verifyToken,
    isCliente,
    [
        body('numeroCuenta').notEmpty().withMessage('El numero de cuenta es requerido'),
        body('tipoCuenta').isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta invalido'),
        body('alias').notEmpty().withMessage('El alias es requerido').trim()
    ],
    handleValidationErrors,
    addFavorite
);

// PUT /api/favorites/:id
router.put(
    '/:id',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('alias').notEmpty().withMessage('El alias es requerido').trim()
    ],
    handleValidationErrors,
    updateFavorite
);

// DELETE /api/favorites/:id
router.delete(
    '/:id',
    verifyToken,
    isCliente,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    deleteFavorite
);

// POST /api/favorites/:id/transfer
router.post(
    '/:id/transfer',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('monto').isFloat({ min: 0.01, max: 2000 }).withMessage('El monto debe estar entre Q0.01 y Q2,000'),
        body('descripcion').optional().trim()
    ],
    handleValidationErrors,
    transferToFavorite
);

export default router;