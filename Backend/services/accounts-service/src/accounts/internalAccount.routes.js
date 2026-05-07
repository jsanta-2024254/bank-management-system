'use strict';

import { Router } from 'express';
import { body, param, query } from 'express-validator';

import {
  createInternalAccount,
  deactivateInternalAccountsByUser,
  getInternalAccountByUser,
} from './internalAccount.controller.js';

import { verifyInternalApiKey } from '../../middlewares/internal.middleware.js';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

router.use(verifyInternalApiKey);

router.post(
  '/',
  [
    body('userId')
      .notEmpty()
      .withMessage('El userId es requerido')
      .isString()
      .withMessage('El userId debe ser texto'),
    body('tipoCuenta')
      .optional()
      .isIn(['monetaria', 'ahorro'])
      .withMessage('tipoCuenta debe ser monetaria o ahorro'),
    body('saldo')
      .optional()
      .isNumeric()
      .withMessage('El saldo debe ser numérico'),
  ],
  handleValidationErrors,
  createInternalAccount
);

router.get(
  '/by-user/:userId',
  [
    param('userId')
      .notEmpty()
      .withMessage('El userId es requerido')
      .isString()
      .withMessage('El userId debe ser texto'),
    query('estado')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('estado debe ser true o false'),
  ],
  handleValidationErrors,
  getInternalAccountByUser
);

router.patch(
  '/by-user/:userId/deactivate',
  [
    param('userId')
      .notEmpty()
      .withMessage('El userId es requerido')
      .isString()
      .withMessage('El userId debe ser texto'),
  ],
  handleValidationErrors,
  deactivateInternalAccountsByUser
);

export default router;