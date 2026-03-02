'use strict';
import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './adminUser-controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// Validaciones para crear cliente
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
    body('tipoCuenta').optional().isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta inválido')
];

// Validaciones para actualizar cliente (admin NO puede tocar DPI ni contraseña)
const updateUserValidations = [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
    body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío').trim(),
    body('username').optional().notEmpty().withMessage('El username no puede estar vacío').trim(),
    body('email').optional().isEmail().withMessage('Correo inválido').normalizeEmail(),
    body('celular').optional().matches(/^\d{8}$/).withMessage('El celular debe tener exactamente 8 dígitos'),
    body('direccion').optional().notEmpty().withMessage('La dirección no puede estar vacía'),
    body('nombreTrabajo').optional().notEmpty().withMessage('El nombre de trabajo no puede estar vacío'),
    body('ingresosMensuales').optional().isFloat({ min: 100 }).withMessage('Los ingresos deben ser al menos Q100'),
    // Bloqueamos explícitamente los campos no permitidos
    body('dpi').not().exists().withMessage('El administrador no puede modificar el DPI'),
    body('password').not().exists().withMessage('El administrador no puede modificar la contraseña'),
];

// POST /api/v1/admin/users
router.post(
    '/',
    verifyToken,
    isAdmin,
    createUserValidations,
    handleValidationErrors,
    createUser
);

// GET /api/v1/admin/users
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

// GET /api/v1/admin/users/:id
router.get(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido')],
    handleValidationErrors,
    getUserById
);

// PUT /api/v1/admin/users/:id
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido'), ...updateUserValidations],
    handleValidationErrors,
    updateUser
);

// DELETE /api/v1/admin/users/:id
router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido')],
    handleValidationErrors,
    deleteUser
);

export default router;