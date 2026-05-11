'use strict';

import { Router } from 'express';
import {
    createAccount,
    createMyAccount,
    deleteAccount,
    getBalance,
    getMyAccounts,
    getTopMovements,
    updateAccount,
} from './account.controller.js';
import { verifyToken, isAdmin, isCliente } from '../../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

router.get(
    '/top-movements',
    verifyToken,
    isAdmin,
    [
        query('order')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('El orden debe ser asc o desc'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('El límite debe estar entre 1 y 100'),
    ],
    handleValidationErrors,
    getTopMovements
);

router.get(
    '/my-accounts',
    verifyToken,
    getMyAccounts
);

router.post(
    '/my-accounts',
    verifyToken,
    isCliente,
    [
        body('tipoCuenta')
            .optional()
            .isIn(['monetaria', 'ahorro'])
            .withMessage('tipoCuenta debe ser monetaria o ahorro'),
        body('saldo')
            .not()
            .exists()
            .withMessage('El cliente no puede definir monto inicial'),
        body('userId')
            .not()
            .exists()
            .withMessage('El cliente no puede asignar la cuenta a otro usuario'),
        body('usuario')
            .not()
            .exists()
            .withMessage('El cliente no puede asignar la cuenta a otro usuario'),
        body('estado')
            .not()
            .exists()
            .withMessage('El cliente no puede definir el estado de la cuenta'),
    ],
    handleValidationErrors,
    createMyAccount
);

router.post(
    '/',
    verifyToken,
    isAdmin,
    [
        body('userId')
            .notEmpty()
            .withMessage('El usuario es requerido')
            .isString()
            .withMessage('El usuario debe ser texto'),
        body('tipoCuenta')
            .optional()
            .isIn(['monetaria', 'ahorro'])
            .withMessage('tipoCuenta debe ser monetaria o ahorro'),
        body('saldo')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('El saldo inicial debe ser mayor o igual a 0'),
    ],
    handleValidationErrors,
    createAccount
);

router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [
        param('id')
            .isMongoId()
            .withMessage('ID de cuenta inválido'),
        body('tipoCuenta')
            .optional()
            .isIn(['monetaria', 'ahorro'])
            .withMessage('tipoCuenta debe ser monetaria o ahorro'),
        body('saldo')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('El saldo debe ser mayor o igual a 0'),
        body('estado')
            .optional()
            .isBoolean()
            .withMessage('El estado debe ser verdadero o falso'),
    ],
    handleValidationErrors,
    updateAccount
);

router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [
        param('id')
            .isMongoId()
            .withMessage('ID de cuenta inválido'),
    ],
    handleValidationErrors,
    deleteAccount
);

router.get(
    '/:id/balance',
    verifyToken,
    [
        param('id')
            .isMongoId()
            .withMessage('ID de cuenta inválido'),
    ],
    handleValidationErrors,
    getBalance
);

export default router;