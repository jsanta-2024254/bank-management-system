'use strict';
import Product from './product.model.js';

// GET /api/products
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, categoria } = req.query;
        const filter = { activo: true };
        if (categoria) filter.categoria = categoria;

        const products = await Product.find(filter)
            .populate('creadoPor', 'nombre username')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

// GET /api/products/:id 
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, activo: true })
            .populate('creadoPor', 'nombre username');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};

// POST /api/admin/products
export const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body, creadoPor: req.user.id };
        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        });
    }
};

// PUT /api/admin/products/
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

// DELETE /api/admin/products/:id 
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { activo: false } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto desactivado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};
