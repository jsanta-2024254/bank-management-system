'use strict';
import { Router } from 'express';
import {
    getFavorites,
    addFavorite,
    updateFavorite,
    deleteFavorite,
    transferToFavorite,
} from './favorite.controller.js';
import { verifyToken, isCliente } from '../../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

/**
 * @swagger
 * /favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Obtiene los favoritos del cliente
 *     description: Retorna la lista de cuentas favoritas del cliente autenticado.
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/',
    verifyToken,
    isCliente,
    getFavorites
);

/**
 * @swagger
 * /favorites:
 *   post:
 *     tags: [Favorites]
 *     summary: Agrega una cuenta a favoritos
 *     description: Guarda una cuenta bancaria como favorita para el cliente autenticado.
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    verifyToken,
    isCliente,
    [
        body('numeroCuenta').notEmpty().withMessage('El numero de cuenta es requerido'),
        body('tipoCuenta').isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta invalido'),
        body('alias').notEmpty().withMessage('El alias es requerido').trim(),
    ],
    handleValidationErrors,
    addFavorite
);

/**
 * @swagger
 * /favorites/{id}:
 *   put:
 *     tags: [Favorites]
 *     summary: Actualiza el alias de un favorito
 *     description: Modifica el nombre amigable de una cuenta favorita.
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('alias').notEmpty().withMessage('El alias es requerido').trim(),
    ],
    handleValidationErrors,
    updateFavorite
);

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Elimina un favorito
 *     description: Elimina una cuenta de la lista de favoritos del cliente.
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/:id',
    verifyToken,
    isCliente,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    deleteFavorite
);

/**
 * @swagger
 * /favorites/{id}/transfer:
 *   post:
 *     tags: [Favorites]
 *     summary: Transfiere dinero a un favorito
 *     description: Realiza una transferencia directa a una cuenta favorita. El cliente debe indicar tipoCuentaOrigen para evitar debitar una cuenta incorrecta.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del favorito (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - tipoCuentaOrigen
 *             properties:
 *               monto:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 2000
 *                 example: 250.00
 *                 description: Monto a transferir (entre Q0.01 y Q2,000)
 *               tipoCuentaOrigen:
 *                 type: string
 *                 enum: [monetaria, ahorro]
 *                 description: Tipo de cuenta propia desde donde saldrá el dinero
 *               descripcion:
 *                 type: string
 *                 description: Descripción opcional de la transferencia
 */
router.post(
    '/:id/transfer',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('monto')
            .isFloat({ min: 0.01, max: 2000 })
            .withMessage('El monto debe estar entre Q0.01 y Q2,000'),
        body('tipoCuentaOrigen')
            .isIn(['monetaria', 'ahorro'])
            .withMessage('tipoCuentaOrigen invalido. Valores permitidos: monetaria, ahorro'),
        body('descripcion').optional().trim(),
    ],
    handleValidationErrors,
    transferToFavorite
);

export default router;