'use strict';
import { Router } from 'express';
import {
    createDeposit,
    createOwnDeposit,
    getDeposits,
    updateDeposit,
    revertDeposit
} from './deposit.controller.js';
import { verifyToken, isAdmin, isCliente } from '../../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

router.post(
    '/self',
    verifyToken,
    isCliente,
    [
        body('cuentaId').isMongoId().withMessage('La cuenta es requerida'),
        body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0'),
        body('descripcion').optional().trim()
    ],
    handleValidationErrors,
    createOwnDeposit
);

/**
 * @swagger
 * /admin/deposits:
 *   post:
 *     tags: [Deposits]
 *     summary: Crea un nuevo depósito
 *     description: Realiza un depósito a una cuenta bancaria. Solo accesible por administradores.
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
 *               - monto
 *             properties:
 *               numeroCuenta:
 *                 type: string
 *                 description: Número de cuenta destino
 *               tipoCuenta:
 *                 type: string
 *                 enum: [monetaria, ahorro]
 *                 description: Tipo de cuenta
 *               monto:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 500.00
 *                 description: Monto a depositar
 *               descripcion:
 *                 type: string
 *                 description: Descripción opcional del depósito
 *     responses:
 *       201:
 *         description: Depósito creado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cuenta no encontrada
 */
router.post(
    '/',
    verifyToken,
    isAdmin,
    [
        body('numeroCuenta').notEmpty().withMessage('El número de cuenta es requerido'),
        body('tipoCuenta').isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta inválido'),
        body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0'),
        body('descripcion').optional().trim()
    ],
    handleValidationErrors,
    createDeposit
);

/**
 * @swagger
 * /admin/deposits:
 *   get:
 *     tags: [Deposits]
 *     summary: Lista todos los depósitos
 *     description: Retorna el historial de depósitos con paginación y filtros. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Resultados por página
 *       - in: query
 *         name: revertido
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filtrar por depósitos revertidos o no
 *     responses:
 *       200:
 *         description: Lista de depósitos
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get(
    '/',
    verifyToken,
    isAdmin,
    [
        query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser mayor que 0'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
        query('revertido').optional().isBoolean().withMessage('El filtro revertido debe ser true o false')
    ],
    handleValidationErrors,
    getDeposits
);

/**
 * @swagger
 * /admin/deposits/{id}:
 *   put:
 *     tags: [Deposits]
 *     summary: Modifica el monto de un depósito
 *     description: Actualiza el monto de un depósito existente. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito (MongoDB ObjectId)
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
 *                 example: 750.00
 *                 description: Nuevo monto del depósito
 *     responses:
 *       200:
 *         description: Depósito actualizado exitosamente
 *       400:
 *         description: ID o monto inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Depósito no encontrado
 */
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [
        param('id').isMongoId().withMessage('ID de depósito inválido'),
        body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0')
    ],
    handleValidationErrors,
    updateDeposit
);

/**
 * @swagger
 * /admin/deposits/{id}/revert:
 *   post:
 *     tags: [Deposits]
 *     summary: Revierte un depósito
 *     description: Cancela un depósito dentro de la ventana de 1 minuto desde su creación. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del depósito a revertir (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Depósito revertido exitosamente
 *       400:
 *         description: ID inválido o ventana de tiempo expirada
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Depósito no encontrado
 */
router.post(
    '/:id/revert',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID de depósito inválido')],
    handleValidationErrors,
    revertDeposit
);

export default router;