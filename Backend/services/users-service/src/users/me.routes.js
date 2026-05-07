'use strict';
import { Router } from 'express';
import { getMyProfile, updateMyProfile } from './me.controller.js';
import { verifyToken, isCliente } from '../../middlewares/auth.middleware.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

/**
 * @swagger
 * /me:
 *   get:
 *     tags: [Me]
 *     summary: Obtiene el perfil propio del cliente
 *     description: Retorna la información del perfil del cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del cliente
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
 */
router.get(
    '/',
    verifyToken,
    isCliente,
    getMyProfile
);

/**
 * @swagger
 * /me:
 *   put:
 *     tags: [Me]
 *     summary: Actualiza el perfil propio del cliente
 *     description: Permite al cliente editar su nombre, dirección, nombre de trabajo e ingresos mensuales.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del cliente
 *               direccion:
 *                 type: string
 *                 description: Dirección del cliente
 *               nombreTrabajo:
 *                 type: string
 *                 description: Nombre del lugar de trabajo
 *               ingresosMensuales:
 *                 type: number
 *                 minimum: 100
 *                 example: 5000.00
 *                 description: Ingresos mensuales (mínimo Q100)
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de cliente
 */
router.put(
    '/',
    verifyToken,
    isCliente,
    [
        body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
        body('direccion').optional().notEmpty().withMessage('La dirección no puede estar vacía').trim(),
        body('nombreTrabajo').optional().notEmpty().withMessage('El nombre de trabajo no puede estar vacío').trim(),
        body('ingresosMensuales').optional().isFloat({ min: 100 }).withMessage('Los ingresos mensuales deben ser al menos Q100'),
    ],
    handleValidationErrors,
    updateMyProfile
);

export default router;