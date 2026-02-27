'use strict';
import { Router } from 'express';
import { login, refreshToken, logout } from './auth-controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// POST /api/auth/login
router.post(
    '/login',
    [
        body('emailOrUsername').notEmpty().withMessage('El email o username es requerido').trim(),
        body('password').notEmpty().withMessage('La contrasena es requerida')
    ],
    handleValidationErrors,
    login
);

// POST /api/auth/refresh
router.post(
    '/refresh',
    [
        body('refreshToken').notEmpty().withMessage('El refresh token es requerido')
    ],
    handleValidationErrors,
    refreshToken
);

// POST /api/auth/logout
router.post('/logout', verifyToken, logout);

export default router;