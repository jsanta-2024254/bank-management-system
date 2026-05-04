import { Router } from 'express';
import {
  updateUserRole,
  getUserRoles,
  getUsersByRole,
} from '../users/user-controller.js';

const router = Router();

/**
 * @swagger
 * /users/{userId}/role:
 *   put:
 *     tags: [Users]
 *     summary: Actualiza el rol de un usuario
 *     description: Asigna o cambia el rol de un usuario en el sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 description: Nombre del rol a asignar
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *       401:
 *         description: Token inválido o no proporcionado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:userId/role', ...updateUserRole);

/**
 * @swagger
 * /users/{userId}/roles:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene los roles de un usuario
 *     description: Retorna todos los roles asignados a un usuario específico.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de roles del usuario
 *       401:
 *         description: Token inválido o no proporcionado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:userId/roles', ...getUserRoles);

/**
 * @swagger
 * /users/by-role/{roleName}:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene usuarios por rol
 *     description: Retorna todos los usuarios que tienen asignado un rol específico.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del rol a buscar
 *     responses:
 *       200:
 *         description: Lista de usuarios con ese rol
 *       401:
 *         description: Token inválido o no proporcionado
 *       404:
 *         description: Rol no encontrado
 */
router.get('/by-role/:roleName', ...getUsersByRole);

export default router;