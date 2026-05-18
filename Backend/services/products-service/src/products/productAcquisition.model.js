'use strict';
import mongoose from 'mongoose';

export const paymentScheduleSchema = mongoose.Schema(
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
            default: 0,
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
                values: ['compra', 'compra_cuotas', 'suscripcion', 'ahorro', 'inversion'],
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
        numeroCuotas: {
            type: Number,
            default: 1,
            min: [1, 'La cantidad de cuotas debe ser mayor o igual a 1'],
        },
        montoCobradoInicial: {
            type: Number,
            default: 0,
        },
        totalPagado: {
            type: Number,
            default: 0,
        },
        totalPendiente: {
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
        transacciones: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Transaction',
            default: [],
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