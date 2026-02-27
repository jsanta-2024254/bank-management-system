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
    body('username').notEmpty().withMessage('El username es requerido').trim(),
    body('email').isEmail().withMessage('Correo invalido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres'),
    body('dpi').matches(/^\d{13}$/).withMessage('El DPI debe tener 13 digitos'),
    body('direccion').notEmpty().withMessage('La direccion es requerida'),
    body('celular').matches(/^\d{8,15}$/).withMessage('Celular invalido'),
    body('nombreTrabajo').notEmpty().withMessage('El nombre de trabajo es requerido'),
    body('ingresosMensuales').isFloat({ min: 100 }).withMessage('Los ingresos deben ser al menos Q100'),
    body('tipoCuenta').optional().isIn(['monetaria', 'ahorro']).withMessage('Tipo de cuenta invalido')
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
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    getUserById
);

// PUT /api/admin/users/:id
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    updateUser
);

// DELETE /api/admin/users/:id
router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    deleteUser
);

export default router;