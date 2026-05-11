'use strict';
import { Router } from 'express';
import { getMyProfile, updateMyProfile } from './me.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

/**
 * @swagger
 * /me:
 *   get:
 *     tags: [Me]
 *     summary: Obtiene el perfil propio del usuario autenticado
 *     description: Retorna la información del usuario autenticado, sea administrador o cliente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: Token inválido o no proporcionado
 */
router.get(
  '/',
  verifyToken,
  getMyProfile
);

/**
 * @swagger
 * /me:
 *   put:
 *     tags: [Me]
 *     summary: Actualiza el perfil propio del usuario autenticado
 *     description: Permite editar datos básicos del usuario autenticado. Los campos de cliente solo se actualizan si el usuario tiene perfil de cliente.
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
 *               apellido:
 *                 type: string
 *               celular:
 *                 type: string
 *               direccion:
 *                 type: string
 *               nombreTrabajo:
 *                 type: string
 *               ingresosMensuales:
 *                 type: number
 *                 minimum: 100
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 */
router.put(
  '/',
  verifyToken,
  [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
    body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío').trim(),
    body('celular').optional().matches(/^\d{8}$/).withMessage('El celular debe tener exactamente 8 dígitos'),
    body('direccion').optional().notEmpty().withMessage('La dirección no puede estar vacía').trim(),
    body('nombreTrabajo').optional().notEmpty().withMessage('El nombre de trabajo no puede estar vacío').trim(),
    body('ingresosMensuales').optional().isFloat({ min: 100 }).withMessage('Los ingresos mensuales deben ser al menos Q100'),
  ],
  handleValidationErrors,
  updateMyProfile
);

export default router;