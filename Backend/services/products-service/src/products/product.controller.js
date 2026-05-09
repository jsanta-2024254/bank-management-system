'use strict';
import Product from './product.model.js';

// GET /api/v1/products
export const getProducts = async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const { tipo } = req.query;

        const filter = { estado: true };
        if (tipo) filter.tipo = tipo;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
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

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, estado: true });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { nombre, descripcion, tipo, tasaInteres } = req.body;

        const product = new Product({
            nombre,
            descripcion,
            tipo,
            tasaInteres,
            creadoPor: req.user.id
        });

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

export const updateProduct = async (req, res) => {
    try {
        const { nombre, descripcion, tipo, tasaInteres } = req.body;
        const updateData = {};
        if (nombre      !== undefined) updateData.nombre      = nombre;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (tipo        !== undefined) updateData.tipo        = tipo;
        if (tasaInteres !== undefined) updateData.tasaInteres = tasaInteres;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, estado: true },
            { $set: updateData },
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

// DELETE /api/v1/admin/products/:id  (soft delete)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, estado: true },
            { $set: { estado: false } },
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
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};