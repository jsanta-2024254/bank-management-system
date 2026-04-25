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

/**
 * @swagger
 * /favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Obtiene los favoritos del cliente
 *     description: Retorna la lista de cuentas favoritas del cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas favoritas
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroCuenta
 *               - tipoCuenta
 *               - alias
 *             properties:
 *               numeroCuenta:
 *                 type: string
 *                 description: Número de cuenta a agregar como favorito
 *               tipoCuenta:
 *                 type: string
 *                 enum: [monetaria, ahorro]
 *                 description: Tipo de cuenta
 *               alias:
 *                 type: string
 *                 description: Nombre amigable para identificar el favorito
 *     responses:
 *       201:
 *         description: Favorito agregado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
 *       404:
 *         description: Cuenta no encontrada
 */
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

/**
 * @swagger
 * /favorites/{id}:
 *   put:
 *     tags: [Favorites]
 *     summary: Actualiza el alias de un favorito
 *     description: Modifica el nombre amigable de una cuenta favorita.
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
 *               - alias
 *             properties:
 *               alias:
 *                 type: string
 *                 description: Nuevo alias para el favorito
 *     responses:
 *       200:
 *         description: Favorito actualizado exitosamente
 *       400:
 *         description: ID o alias inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
 *       404:
 *         description: Favorito no encontrado
 */
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

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Elimina un favorito
 *     description: Elimina una cuenta de la lista de favoritos del cliente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del favorito (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Favorito eliminado exitosamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
 *       404:
 *         description: Favorito no encontrado
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
 *     description: Realiza una transferencia directa a una cuenta favorita. Monto máximo Q2,000.
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
 *             properties:
 *               monto:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 2000
 *                 example: 250.00
 *                 description: Monto a transferir (entre Q0.01 y Q2,000)
 *               descripcion:
 *                 type: string
 *                 description: Descripción opcional de la transferencia
 *     responses:
 *       200:
 *         description: Transferencia realizada exitosamente
 *       400:
 *         description: ID o monto inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
 *       404:
 *         description: Favorito no encontrado
 */
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