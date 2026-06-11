'use strict';
import { Router } from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    quoteProduct,
    acquireProduct,
    getMyProductAcquisitions,
    payProductInstallment,
    requestCreditFromOpportunity,
    createClientCreditRequest,
    getMyCreditRequests,
    getCreditRequests,
    approveCreditRequest,
    rejectCreditRequest,
    payCreditInstallment,
    cancelSubscription,
} from './product.controller.js';
import { verifyToken, isAdmin, isCliente } from '../../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';
import { TIPOS_PRODUCTO } from './product.model.js';

const router = Router();

const createProductValidations = [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
    body('descripcion').notEmpty().withMessage('La descripcion es requerida').trim(),
    body('tipo').isIn(TIPOS_PRODUCTO).withMessage('Tipo invalido'),

    body('precio')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio no puede ser negativo'),

    body('descuentoAppPorcentaje')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El descuento debe estar entre 0 y 100'),

    body('permitePagoCuotas')
        .optional()
        .isBoolean()
        .withMessage('permitePagoCuotas debe ser booleano'),

    body('cuotasMinimas')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Las cuotas minimas deben ser mayor o igual a 1'),

    body('cuotasMaximas')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Las cuotas maximas deben ser mayor o igual a 1'),

    body('tasaInteres')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La tasa de interes debe ser mayor o igual a 0'),

    body('moraPorcentaje')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La mora debe ser mayor o igual a 0'),

    body('plazoMesesMinimo')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El plazo minimo debe ser mayor o igual a 1'),

    body('plazoMesesMaximo')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El plazo maximo debe ser mayor o igual a 1'),

    body('montoMinimo')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto minimo no puede ser negativo'),

    body('montoMaximo')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto maximo no puede ser negativo'),
];

const updateProductValidations = [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
    body('descripcion').optional().notEmpty().withMessage('La descripcion no puede estar vacía').trim(),
    body('tipo').optional().isIn(TIPOS_PRODUCTO).withMessage('Tipo invalido'),

    body('precio')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio no puede ser negativo'),

    body('descuentoAppPorcentaje')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El descuento debe estar entre 0 y 100'),

    body('permitePagoCuotas')
        .optional()
        .isBoolean()
        .withMessage('permitePagoCuotas debe ser booleano'),

    body('cuotasMinimas')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Las cuotas minimas deben ser mayor o igual a 1'),

    body('cuotasMaximas')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Las cuotas maximas deben ser mayor o igual a 1'),

    body('tasaInteres')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La tasa de interes debe ser mayor o igual a 0'),

    body('moraPorcentaje')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La mora debe ser mayor o igual a 0'),

    body('plazoMesesMinimo')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El plazo minimo debe ser mayor o igual a 1'),

    body('plazoMesesMaximo')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El plazo maximo debe ser mayor o igual a 1'),

    body('montoMinimo')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto minimo no puede ser negativo'),

    body('montoMaximo')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto maximo no puede ser negativo'),

    body('estado')
        .optional()
        .isBoolean()
        .withMessage('El estado debe ser booleano'),
];

const paginationValidations = [
    query('page').optional().isInt({ min: 1 }).withMessage('La pagina debe ser mayor que 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El limite debe estar entre 1 y 100'),
    query('tipo').optional().isIn(TIPOS_PRODUCTO).withMessage('Tipo invalido'),
];

router.get(
    '/',
    verifyToken,
    paginationValidations,
    handleValidationErrors,
    getProducts
);

router.get(
    '/acquisitions/my',
    verifyToken,
    isCliente,
    getMyProductAcquisitions
);

router.get(
    '/credits/my',
    verifyToken,
    isCliente,
    getMyCreditRequests
);

router.get(
    '/credits/requests',
    verifyToken,
    isAdmin,
    [
        query('page').optional().isInt({ min: 1 }).withMessage('La pagina debe ser mayor que 0'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El limite debe estar entre 1 y 100'),
        query('estado')
            .optional()
            .isIn(['pendiente', 'aprobada', 'rechazada', 'cancelada', 'finalizada'])
            .withMessage('Estado invalido'),
    ],
    handleValidationErrors,
    getCreditRequests
);

router.post(
    '/credits/request',
    verifyToken,
    isCliente,
    [
        body('cuentaId').isMongoId().withMessage('La cuenta destino es requerida'),
        body('montoSolicitado').isFloat({ min: 0.01 }).withMessage('El monto solicitado debe ser mayor que 0'),
        body('plazoMeses').isInt({ min: 1 }).withMessage('El plazo debe ser mayor o igual a 1'),
        body('comentarioCliente').optional().isString().trim(),
    ],
    handleValidationErrors,
    createClientCreditRequest
);

router.post(
    '/credits/requests/:id/approve',
    verifyToken,
    isAdmin,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('montoAprobado').optional().isFloat({ min: 0.01 }).withMessage('El monto aprobado debe ser mayor que 0'),
        body('tasaInteres').optional().isFloat({ min: 0 }).withMessage('La tasa debe ser mayor o igual a 0'),
        body('moraPorcentaje').optional().isFloat({ min: 0 }).withMessage('La mora debe ser mayor o igual a 0'),
        body('comentarioAdmin').optional().isString().trim(),
    ],
    handleValidationErrors,
    approveCreditRequest
);

router.post(
    '/credits/requests/:id/reject',
    verifyToken,
    isAdmin,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('comentarioAdmin').optional().isString().trim(),
    ],
    handleValidationErrors,
    rejectCreditRequest
);

router.post(
    '/credits/requests/:requestId/payments/:paymentId/pay',
    verifyToken,
    isCliente,
    [
        param('requestId').isMongoId().withMessage('ID de solicitud invalido'),
        param('paymentId').isMongoId().withMessage('ID de cuota invalido'),
        body('cuentaId').isMongoId().withMessage('La cuenta es requerida'),
    ],
    handleValidationErrors,
    payCreditInstallment
);

router.post(
    '/:id/quote',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('monto').optional().isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0'),
        body('plazoMeses').optional().isInt({ min: 1 }).withMessage('El plazo debe ser mayor o igual a 1'),
        body('numeroCuotas').optional().isInt({ min: 1 }).withMessage('Las cuotas deben ser mayor o igual a 1'),
    ],
    handleValidationErrors,
    quoteProduct
);

router.post(
    '/:id/acquire',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('cuentaId').isMongoId().withMessage('La cuenta es requerida'),
        body('numeroCuotas').optional().isInt({ min: 1 }).withMessage('Las cuotas deben ser mayor o igual a 1'),
    ],
    handleValidationErrors,
    acquireProduct
);

router.post(
    '/:id/request-credit',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),

        body('cuentaId')
            .isMongoId()
            .withMessage('La cuenta destino es requerida'),

        body()
            .custom((value, { req }) => {
                const monto = req.body.montoSolicitado ?? req.body.monto;
                const montoNumerico = Number(monto);

                if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
                    throw new Error('El monto solicitado debe ser mayor que 0');
                }

                req.body.montoSolicitado = montoNumerico;
                return true;
            }),

        body('plazoMeses')
            .isInt({ min: 1 })
            .withMessage('El plazo debe ser mayor o igual a 1'),

        body('comentarioCliente')
            .optional()
            .isString()
            .trim(),
    ],
    handleValidationErrors,
    requestCreditFromOpportunity
);

router.post(
    '/acquisitions/:acquisitionId/payments/:paymentId/pay',
    verifyToken,
    isCliente,
    [
        param('acquisitionId').isMongoId().withMessage('ID de adquisición invalido'),
        param('paymentId').isMongoId().withMessage('ID de cuota invalido'),
        body('cuentaId').isMongoId().withMessage('La cuenta es requerida'),
    ],
    handleValidationErrors,
    payProductInstallment
);

router.post(
    '/subscriptions/:acquisitionId/cancel',
    verifyToken,
    isCliente,
    [
        param('acquisitionId')
            .isMongoId()
            .withMessage('ID de suscripción invalido'),

        body('motivoCancelacion')
            .optional()
            .isString()
            .trim(),
    ],
    handleValidationErrors,
    cancelSubscription
);

router.get(
    '/:id',
    verifyToken,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    getProductById
);

router.post(
    '/',
    verifyToken,
    isAdmin,
    createProductValidations,
    handleValidationErrors,
    createProduct
);

router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido'), ...updateProductValidations],
    handleValidationErrors,
    updateProduct
);

router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    deleteProduct
);

export default router;