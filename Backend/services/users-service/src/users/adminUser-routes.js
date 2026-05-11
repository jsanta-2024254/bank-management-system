'use strict';
import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './adminUser-controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

const createUserValidations = [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
    body('apellido').notEmpty().withMessage('El apellido es requerido').trim(),
    body('username').notEmpty().withMessage('El username es requerido').trim(),
    body('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('dpi').matches(/^\d{13}$/).withMessage('El DPI debe tener exactamente 13 dígitos numéricos'),
    body('direccion').notEmpty().withMessage('La dirección es requerida'),
    body('celular').matches(/^\d{8}$/).withMessage('El celular debe tener exactamente 8 dígitos'),
    body('nombreTrabajo').notEmpty().withMessage('El nombre de trabajo es requerido'),
    body('ingresosMensuales').isFloat({ min: 100 }).withMessage('Los ingresos deben ser al menos Q100'),
    body('tipoCuenta').optional().isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta inválido'),
    body('saldoInicial')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El saldo inicial debe ser un número mayor o igual a 0'),
];

const updateUserValidations = [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
    body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío').trim(),
    body('username').optional().notEmpty().withMessage('El username no puede estar vacío').trim(),
    body('email').optional().isEmail().withMessage('Correo inválido').normalizeEmail(),
    body('celular').optional().matches(/^\d{8}$/).withMessage('El celular debe tener exactamente 8 dígitos'),
    body('direccion').optional().notEmpty().withMessage('La dirección no puede estar vacía'),
    body('nombreTrabajo').optional().notEmpty().withMessage('El nombre de trabajo no puede estar vacío'),
    body('ingresosMensuales').optional().isFloat({ min: 100 }).withMessage('Los ingresos deben ser al menos Q100'),
    body('dpi').not().exists().withMessage('El administrador no puede modificar el DPI'),
    body('password').not().exists().withMessage('El administrador no puede modificar la contraseña'),
];

/**
 * @swagger
 * /admin/users:
 *   post:
 *     tags: [Admin - Users]
 *     summary: Crea un nuevo cliente
 *     description: Registra un nuevo usuario cliente con su perfil y cuenta bancaria. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - username
 *               - email
 *               - password
 *               - dpi
 *               - direccion
 *               - celular
 *               - nombreTrabajo
 *               - ingresosMensuales
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               dpi:
 *                 type: string
 *                 pattern: '^\d{13}$'
 *                 description: DPI con exactamente 13 dígitos
 *               direccion:
 *                 type: string
 *               celular:
 *                 type: string
 *                 pattern: '^\d{8}$'
 *                 description: Celular con exactamente 8 dígitos
 *               nombreTrabajo:
 *                 type: string
 *               ingresosMensuales:
 *                 type: number
 *                 minimum: 100
 *                 example: 5000.00
 *               tipoCuenta:
 *                 type: string
 *                 enum: [monetaria, ahorro]
 *                 description: Tipo de cuenta a crear. Si no se envía, se crea monetaria.
 *               saldoInicial:
 *                 type: number
 *                 minimum: 0
 *                 example: 250.00
 *                 description: Saldo inicial de la cuenta creada por el administrador. Si no se envía, inicia en 0.
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: Email, username o DPI ya existe
 */
router.post(
    '/',
    verifyToken,
    isAdmin,
    createUserValidations,
    handleValidationErrors,
    createUser
);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Lista todos los clientes
 *     description: Retorna la lista de usuarios con paginación y filtro por estado. Solo accesible por administradores.
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
 *         name: estado
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de clientes
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
        query('estado').optional().isBoolean().withMessage('El estado debe ser true o false')
    ],
    handleValidationErrors,
    getUsers
);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Obtiene un cliente por ID
 *     description: Retorna el detalle de un usuario específico. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Detalle del cliente
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido')],
    handleValidationErrors,
    getUserById
);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     tags: [Admin - Users]
 *     summary: Actualiza un cliente
 *     description: Modifica los datos de un usuario. El administrador NO puede cambiar DPI ni contraseña. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               celular:
 *                 type: string
 *                 pattern: '^\d{8}$'
 *               direccion:
 *                 type: string
 *               nombreTrabajo:
 *                 type: string
 *               ingresosMensuales:
 *                 type: number
 *                 minimum: 100
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido'), ...updateUserValidations],
    handleValidationErrors,
    updateUser
);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin - Users]
 *     summary: Elimina un cliente
 *     description: Elimina o desactiva un usuario del sistema. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido')],
    handleValidationErrors,
    deleteUser
);

export default router;