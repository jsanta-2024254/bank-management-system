'use strict';

import { Router } from 'express';
import { body, param, query } from 'express-validator';

import {
  createInternalTransaction,
  getInternalTransactionById,
  getInternalTransactionsByAccount,
} from './internalTransaction.controller.js';

import { verifyInternalApiKey } from '../../middlewares/internal.middleware.js';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

router.use(verifyInternalApiKey);

router.post(
  '/',
  [
    body('tipo')
      .isIn(['deposito', 'transferencia', 'compra', 'credito', 'reversion'])
      .withMessage('Tipo de transacción inválido'),
    body('monto')
      .isFloat({ min: 0.01 })
      .withMessage('El monto debe ser mayor que 0'),
    body('descripcion')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 300 })
      .withMessage('La descripción no puede exceder 300 caracteres'),
    body('cuentaOrigen')
      .optional({ nullable: true })
      .isMongoId()
      .withMessage('cuentaOrigen debe ser un ObjectId válido'),
    body('cuentaDestino')
      .optional({ nullable: true })
      .isMongoId()
      .withMessage('cuentaDestino debe ser un ObjectId válido'),
    body('saldoAnteriorOrigen')
      .optional({ nullable: true })
      .isNumeric()
      .withMessage('saldoAnteriorOrigen debe ser numérico'),
    body('saldoPosteriorOrigen')
      .optional({ nullable: true })
      .isNumeric()
      .withMessage('saldoPosteriorOrigen debe ser numérico'),
    body('saldoAnteriorDestino')
      .optional({ nullable: true })
      .isNumeric()
      .withMessage('saldoAnteriorDestino debe ser numérico'),
    body('saldoPosteriorDestino')
      .optional({ nullable: true })
      .isNumeric()
      .withMessage('saldoPosteriorDestino debe ser numérico'),
    body('estado')
      .optional()
      .isIn(['completada', 'revertida'])
      .withMessage('Estado inválido'),
    body('ejecutadaPor')
      .notEmpty()
      .withMessage('ejecutadaPor es requerido')
      .isString()
      .withMessage('ejecutadaPor debe ser texto'),
  ],
  handleValidationErrors,
  createInternalTransaction
);

router.get(
  '/by-account/:accountId',
  [
    param('accountId')
      .isMongoId()
      .withMessage('accountId debe ser un ObjectId válido'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('limit debe estar entre 1 y 50'),
  ],
  handleValidationErrors,
  getInternalTransactionsByAccount
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID de transacción inválido')],
  handleValidationErrors,
  getInternalTransactionById
);

export default router;