'use strict';
import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './adminUser-controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// Validaciones para crear usuario
const createUserValidations = [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
    body('apellido').notEmpty().withMessage('El apellido es requerido').trim(),
    body('username').notEmpty().withMessage('El username es requerido').trim(),
    body('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('dpi').matches(/^\d{13}$/).withMessage('El DPI debe tener 13 dígitos'),
    body('direccion').notEmpty().withMessage('La dirección es requerida'),
    body('celular').matches(/^\d{8}$/).withMessage('El celular debe tener exactamente 8 dígitos'),
    body('nombreTrabajo').notEmpty().withMessage('El nombre de trabajo es requerido'),
    body('ingresosMensuales').isFloat({ min: 100 }).withMessage('Los ingresos deben ser al menos Q100'),
    body('tipoCuenta').optional().isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta inválido')
];

// POST /api/admin/users
router.post(
    '/',
    verifyToken,
    isAdmin,
    createUserValidations,
    handleValidationErrors,
    createUser
);

// GET /api/admin/users
router.get(
    '/',
    verifyToken,
    isAdmin,
    getUsers
);

// GET /api/admin/users/:id
router.get(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido')],
    handleValidationErrors,
    getUserById
);

// PUT /api/admin/users/:id
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido')],
    handleValidationErrors,
    updateUser
);

// DELETE /api/admin/users/:id
router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').notEmpty().withMessage('ID inválido')],
    handleValidationErrors,
    deleteUser
);

export default router;