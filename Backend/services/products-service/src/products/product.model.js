'use strict';
import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del producto es requerido'],
            trim: true,
            maxLength: [150, 'El nombre no puede exceder 150 caracteres']
        },
        descripcion: {
            type: String,
            required: [true, 'La descripcion es requerida'],
            trim: true,
            maxLength: [500, 'La descripcion no puede exceder 500 caracteres']
        },
        precio: {
            type: Number,
            required: [true, 'El precio es requerido'],
            min: [0.01, 'El precio debe ser mayor que 0']
        },
        categoria: {
            type: String,
            required: [true, 'La categoria es requerida'],
            trim: true,
            enum: {
                values: ['calzado', 'ropa', 'tecnologia', 'servicios', 'hogar', 'salud', 'entretenimiento', 'otros'],
                message: 'Categoria invalida'
            }
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, 'El stock no puede ser negativo']
        },
        exclusivo: {
            type: Boolean,
            default: true
        },
        activo: {
            type: Boolean,
            default: true
        },
        creadoPor: {
            type: String,
            required: [true, 'El creador del producto es requerido']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

productSchema.index({ activo: 1 });
productSchema.index({ categoria: 1 });
productSchema.index({ activo: 1, categoria: 1 });

export default mongoose.model('Product', productSchema);