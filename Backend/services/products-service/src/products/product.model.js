'use strict';
import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del producto es requerido'],
            trim: true,
            maxLength: [150, 'El nombre no puede exceder 150 caracteres'],
        },
        descripcion: {
            type: String,
            required: [true, 'La descripcion es requerida'],
            trim: true,
            maxLength: [500, 'La descripcion no puede exceder 500 caracteres'],
        },
        tipo: {
            type: String,
            required: [true, 'El tipo es requerido'],
            trim: true,
            enum: {
                values: ['ahorro', 'credito', 'inversion', 'servicio', 'suscripcion'],
                message: 'Tipo invalido',
            },
        },
        precio: {
            type: Number,
            default: 0,
            min: [0, 'El precio no puede ser negativo'],
        },
        descuentoAppPorcentaje: {
            type: Number,
            default: 0,
            min: [0, 'El descuento no puede ser negativo'],
            max: [100, 'El descuento no puede ser mayor a 100'],
        },
        tasaInteres: {
            type: Number,
            default: 0,
            min: [0, 'La tasa de interes no puede ser negativa'],
        },
        moraPorcentaje: {
            type: Number,
            default: 5,
            min: [0, 'La mora no puede ser negativa'],
        },
        plazoMesesMinimo: {
            type: Number,
            default: 1,
            min: [1, 'El plazo minimo debe ser mayor o igual a 1'],
        },
        plazoMesesMaximo: {
            type: Number,
            default: 60,
            min: [1, 'El plazo maximo debe ser mayor o igual a 1'],
        },
        montoMinimo: {
            type: Number,
            default: 0,
            min: [0, 'El monto minimo no puede ser negativo'],
        },
        montoMaximo: {
            type: Number,
            default: 0,
            min: [0, 'El monto maximo no puede ser negativo'],
        },
        estado: {
            type: Boolean,
            default: true,
        },
        creadoPor: {
            type: String,
            required: [true, 'El creador del producto es requerido'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

productSchema.index({ estado: 1 });
productSchema.index({ tipo: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);