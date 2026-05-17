'use strict';
import mongoose from 'mongoose';

const paymentScheduleSchema = mongoose.Schema(
    {
        numeroCuota: {
            type: Number,
            required: true,
        },
        fechaPago: {
            type: Date,
            required: true,
        },
        capital: {
            type: Number,
            required: true,
        },
        interes: {
            type: Number,
            required: true,
        },
        montoCuota: {
            type: Number,
            required: true,
        },
        moraAplicada: {
            type: Number,
            default: 0,
        },
        montoPagado: {
            type: Number,
            default: 0,
        },
        fechaPagado: {
            type: Date,
            default: null,
        },
        estado: {
            type: String,
            enum: {
                values: ['pendiente', 'pagada'],
                message: 'Estado de cuota invalido',
            },
            default: 'pendiente',
        },
    },
    {
        _id: true,
        versionKey: false,
    }
);

const productAcquisitionSchema = mongoose.Schema(
    {
        usuario: {
            type: String,
            required: [true, 'El usuario es requerido'],
            trim: true,
        },
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'El producto es requerido'],
        },
        cuenta: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'La cuenta es requerida'],
        },
        tipoOperacion: {
            type: String,
            required: true,
            enum: {
                values: ['compra', 'suscripcion', 'credito'],
                message: 'Tipo de operacion invalido',
            },
        },
        precioBase: {
            type: Number,
            default: 0,
        },
        descuentoAppPorcentaje: {
            type: Number,
            default: 0,
        },
        descuentoAplicado: {
            type: Number,
            default: 0,
        },
        monto: {
            type: Number,
            required: true,
            min: [0.01, 'El monto debe ser mayor que 0'],
        },
        tasaInteresAplicada: {
            type: Number,
            default: 0,
        },
        moraPorcentajeAplicada: {
            type: Number,
            default: 0,
        },
        plazoMeses: {
            type: Number,
            default: null,
        },
        totalInteres: {
            type: Number,
            default: 0,
        },
        totalEstimado: {
            type: Number,
            default: 0,
        },
        cuotaMensualEstimada: {
            type: Number,
            default: null,
        },
        cronogramaPagos: {
            type: [paymentScheduleSchema],
            default: [],
        },
        fechaProximoCobro: {
            type: Date,
            default: null,
        },
        beneficio: {
            type: String,
            default: null,
        },
        transaccion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            default: null,
        },
        estado: {
            type: String,
            enum: {
                values: ['activa', 'finalizada', 'cancelada'],
                message: 'Estado invalido',
            },
            default: 'activa',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

productAcquisitionSchema.index({ usuario: 1, createdAt: -1 });
productAcquisitionSchema.index({ producto: 1 });
productAcquisitionSchema.index({ cuenta: 1 });
productAcquisitionSchema.index({ tipoOperacion: 1 });
productAcquisitionSchema.index({ estado: 1 });

export default mongoose.models.ProductAcquisition ||
    mongoose.model('ProductAcquisition', productAcquisitionSchema);