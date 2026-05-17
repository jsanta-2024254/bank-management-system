'use strict';
import { Router } from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    quoteProduct,
    acquireProduct,
    getMyProductAcquisitions,
    payCreditInstallment,
} from './product.controller.js';
import { verifyToken, isAdmin, isCliente } from '../../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

const TIPOS = ['ahorro', 'credito', 'inversion', 'servicio', 'suscripcion'];

const createValidations = [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
    body('descripcion').notEmpty().withMessage('La descripcion es requerida').trim(),
    body('tipo').isIn(TIPOS).withMessage('Tipo invalido'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),
    body('descuentoAppPorcentaje').optional().isFloat({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0 y 100'),
    body('tasaInteres').optional().isFloat({ min: 0 }).withMessage('La tasa de interes debe ser mayor o igual a 0'),
    body('moraPorcentaje').optional().isFloat({ min: 0 }).withMessage('La mora debe ser mayor o igual a 0'),
    body('plazoMesesMinimo').optional().isInt({ min: 1 }).withMessage('El plazo minimo debe ser mayor o igual a 1'),
    body('plazoMesesMaximo').optional().isInt({ min: 1 }).withMessage('El plazo maximo debe ser mayor o igual a 1'),
    body('montoMinimo').optional().isFloat({ min: 0 }).withMessage('El monto minimo no puede ser negativo'),
    body('montoMaximo').optional().isFloat({ min: 0 }).withMessage('El monto maximo no puede ser negativo'),
];

const createValidations = [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
    body('descripcion').notEmpty().withMessage('La descripcion es requerida').trim(),
    body('tipo').isIn(TIPOS).withMessage('Tipo invalido'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),
    body('descuentoAppPorcentaje').optional().isFloat({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0 y 100'),
    body('tasaInteres').optional().isFloat({ min: 0 }).withMessage('La tasa de interes debe ser mayor o igual a 0'),
    body('moraPorcentaje').optional().isFloat({ min: 0 }).withMessage('La mora debe ser mayor o igual a 0'),
    body('plazoMesesMinimo').optional().isInt({ min: 1 }).withMessage('El plazo minimo debe ser mayor o igual a 1'),
    body('plazoMesesMaximo').optional().isInt({ min: 1 }).withMessage('El plazo maximo debe ser mayor o igual a 1'),
    body('montoMinimo').optional().isFloat({ min: 0 }).withMessage('El monto minimo no puede ser negativo'),
    body('montoMaximo').optional().isFloat({ min: 0 }).withMessage('El monto maximo no puede ser negativo'),
];

const paginationValidations = [
    query('page').optional().isInt({ min: 1 }).withMessage('La pagina debe ser mayor que 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El limite debe estar entre 1 y 100'),
    query('tipo').optional().isIn(TIPOS).withMessage('Tipo invalido')
];

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Lista todos los productos
 *     description: Retorna los productos disponibles con paginación y filtro por categoría.
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
 *         name: categoria
 *         required: false
 *         schema:
 *           type: string
 *           enum: [calzado, ropa, tecnologia, servicios, hogar, salud, entretenimiento, otros]
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de productos
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 */
router.get(
    '/',
    verifyToken,
    paginationValidations,
    handleValidationErrors,
    getProducts
);

router.get(
    '/acquisitions/my',
    verifyToken,
    isCliente,
    getMyProductAcquisitions
);

router.post(
    '/:id/quote',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('monto').optional().isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0'),
        body('plazoMeses').optional().isInt({ min: 1 }).withMessage('El plazo debe ser mayor o igual a 1'),
    ],
    handleValidationErrors,
    quoteProduct
);

router.post(
    '/:id/acquire',
    verifyToken,
    isCliente,
    [
        param('id').isMongoId().withMessage('ID invalido'),
        body('cuentaId').isMongoId().withMessage('La cuenta es requerida'),
        body('monto').optional().isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor que 0'),
        body('plazoMeses').optional().isInt({ min: 1 }).withMessage('El plazo debe ser mayor o igual a 1'),
    ],
    handleValidationErrors,
    acquireProduct
);

router.post(
    '/acquisitions/:acquisitionId/payments/:paymentId/pay',
    verifyToken,
    isCliente,
    [
        param('acquisitionId').isMongoId().withMessage('ID de adquisición invalido'),
        param('paymentId').isMongoId().withMessage('ID de cuota invalido'),
        body('cuentaId').isMongoId().withMessage('La cuenta es requerida'),
    ],
    handleValidationErrors,
    payCreditInstallment
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Obtiene un producto por ID
 *     description: Retorna el detalle de un producto específico.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Detalle del producto
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       404:
 *         description: Producto no encontrado
 */
router.get(
    '/:id',
    verifyToken,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    getProductById
);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     tags: [Products]
 *     summary: Crea un nuevo producto
 *     description: Agrega un producto al catálogo. Solo accesible por administradores.
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
 *               - descripcion
 *               - precio
 *               - categoria
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del producto
 *               descripcion:
 *                 type: string
 *                 description: Descripción del producto
 *               precio:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 199.99
 *                 description: Precio del producto
 *               categoria:
 *                 type: string
 *                 enum: [calzado, ropa, tecnologia, servicios, hogar, salud, entretenimiento, otros]
 *                 description: Categoría del producto
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *                 description: Stock disponible (opcional)
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 */
router.post(
    '/',
    verifyToken,
    isAdmin,
    createValidations,
    handleValidationErrors,
    createProduct
);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Actualiza un producto
 *     description: Modifica los datos de un producto existente. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *                 minimum: 0.01
 *               categoria:
 *                 type: string
 *                 enum: [calzado, ropa, tecnologia, servicios, hogar, salud, entretenimiento, otros]
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               exclusivo:
 *                 type: boolean
 *                 description: Si el producto es exclusivo para clientes premium
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: ID o datos inválidos
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Producto no encontrado
 */
router.put(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido'), ...updateValidations],
    handleValidationErrors,
    updateProduct
);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Elimina un producto
 *     description: Elimina un producto del catálogo. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token inválido o no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Producto no encontrado
 */
router.delete(
    '/:id',
    verifyToken,
    isAdmin,
    [param('id').isMongoId().withMessage('ID invalido')],
    handleValidationErrors,
    deleteProduct
);

export default router;