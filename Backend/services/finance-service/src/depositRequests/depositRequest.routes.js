'use strict';
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
    approveDepositRequest,
    createDepositRequest,
    getDepositRequests,
    getMyDepositRequests,
    rejectDepositRequest,
} from './depositRequest.controller.js';
import {
    verifyToken,
    isAdmin,
    isCliente,
} from '../../middlewares/auth.middleware.js';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

router.post(
    '/',
    verifyToken,
    isCliente,
    [
        body('cuentaId').isMongoId().withMessage('La cuenta es requerida'),
        body('tipoDeposito')
            .isIn(['efectivo', 'cheque'])
            .withMessage('Tipo de depósito inválido'),
        body('monto')
            .isFloat({ min: 0.01 })
            .withMessage('El monto debe ser mayor que 0'),
        body('referencia').optional().trim(),
        body('comentarioUsuario').optional().trim(),
    ],
    handleValidationErrors,
    createDepositRequest
);

router.get('/my', verifyToken, isCliente, getMyDepositRequests);

router.get(
    '/',
    verifyToken,
    isAdmin,
    [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('La página debe ser mayor que 0'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('El límite debe estar entre 1 y 100'),
        query('estado')
            .optional()
            .isIn(['pendiente', 'aprobada', 'rechazada'])
            .withMessage('Estado inválido'),
    ],
    handleValidationErrors,
    getDepositRequests
);

router.post(
    '/:id/approve',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID de solicitud inválido')],
    handleValidationErrors,
    approveDepositRequest
);

router.post(
    '/:id/reject',
    verifyToken,
    isAdmin,
    [
        param('id').isMongoId().withMessage('ID de solicitud inválido'),
        body('motivoRechazo').optional().trim(),
    ],
    handleValidationErrors,
    rejectDepositRequest
);

export default router;