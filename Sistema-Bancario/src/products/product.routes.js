'use strict';
import { Router } from 'express';
import {
    getProducts, getProductById,
    createProduct, updateProduct, deleteProduct
} from './product.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

const CATEGORIAS = ['calzado', 'ropa', 'tecnologia', 'servicios', 'hogar', 'salud', 'entretenimiento', 'otros'];

const createValidations = [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
    body('descripcion').notEmpty().withMessage('La descripcion es requerida').trim(),
    body('precio').isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que 0'),
    body('categoria').isIn(CATEGORIAS).withMessage('Categoria invalida'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser mayor o igual a 0')
];

const updateValidations = [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
    body('descripcion').optional().notEmpty().withMessage('La descripcion no puede estar vacía').trim(),
    body('precio').optional().isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que 0'),
    body('categoria').optional().isIn(CATEGORIAS).withMessage('Categoria invalida'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser mayor o igual a 0'),
    body('exclusivo').optional().isBoolean().withMessage('El campo exclusivo debe ser booleano')
];

const paginationValidations = [
    query('page').optional().isInt({ min: 1 }).withMessage('La pagina debe ser mayor que 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El limite debe estar entre 1 y 100'),
    query('categoria').optional().isIn(CATEGORIAS).withMessage('Categoria invalida')
];

// GET /api/v1/products
router.get(
    '/',
    verifyToken,
    paginationValidations,
    handleValidationErrors,
    getProducts
);

// GET /api/v1/products/:id
router.get(
    '/:id',
    verifyToken,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    getProductById
);

// POST /api/v1/admin/products (solo admin)
router.post(
    '/',
    verifyToken,
    isAdmin,
    createValidations,
    handleValidationErrors,
    createProduct
);

// PUT /api/v1/admin/products/:id (solo admin)
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido'), ...updateValidations],
    handleValidationErrors,
    updateProduct
);

// DELETE /api/v1/admin/products/:id (solo admin)
router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    deleteProduct
);

export default router;