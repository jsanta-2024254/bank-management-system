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
        tipo: {
            type: String,
            required: [true, 'El tipo es requerido'],
            trim: true,
            enum: {
                values: ['ahorro', 'credito', 'inversion'],
                message: 'Tipo invalido'
            }
        },
        tasaInteres: {
            type: Number,
            required: [true, 'La tasa de interes es requerida'],
            min: [0, 'La tasa de interes no puede ser negativa']
        },
        estado: {
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

productSchema.index({ estado: 1 });

export default mongoose.model('Product', productSchema);