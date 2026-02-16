'use strict';
import { Router } from 'express';
import {
    getProducts, getProductById,
    createProduct, updateProduct, deleteProduct
} from './product.controller.js';
import { verifyToken, isAdmin } from '../../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

const createValidations = [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
    body('descripcion').notEmpty().withMessage('La descripcion es requerida').trim(),
    body('precio').isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que 0'),
    body('categoria').isIn(['calzado','ropa','tecnologia','servicios','hogar','salud','entretenimiento','otros'])
        .withMessage('Categoria invalida'),
    body('stock').optional().isInt({ min: -1 }).withMessage('Stock invalido')
];

// GET /api/products
router.get('/', verifyToken, getProducts);

// GET /api/products/:id
router.get(
    '/:id',
    verifyToken,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    getProductById
);

// POST /api/admin/products  el admin lo usa via /api/admin/products en index.js
router.post(
    '/',
    verifyToken,
    isAdmin,
    createValidations,
    handleValidationErrors,
    createProduct
);

// PUT /api/admin/products/:id
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    updateProduct
);

// DELETE /api/admin/products/:id
router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    deleteProduct
);

export default router;
