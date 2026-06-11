'use strict';
import mongoose from 'mongoose';
import { paymentScheduleSchema } from './productAcquisition.model.js';

const creditRequestSchema = mongoose.Schema(
    {
        usuario: {
            type: String,
            required: [true, 'El usuario es requerido'],
            trim: true,
        },
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
        },
        cuenta: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'La cuenta destino es requerida'],
        },
        origenSolicitud: {
            type: String,
            enum: {
                values: ['oportunidad_banco', 'solicitud_cliente'],
                message: 'Origen de solicitud invalido',
            },
            required: true,
        },
        nombre: {
            type: String,
            trim: true,
            default: 'Solicitud de credito',
        },
        descripcion: {
            type: String,
            trim: true,
            default: null,
        },
        montoSolicitado: {
            type: Number,
            required: [true, 'El monto solicitado es requerido'],
            min: [0.01, 'El monto solicitado debe ser mayor que 0'],
        },
        montoAprobado: {
            type: Number,
            default: null,
        },
        plazoMeses: {
            type: Number,
            required: [true, 'El plazo es requerido'],
            min: [1, 'El plazo debe ser mayor o igual a 1'],
        },
        tasaInteresAplicada: {
            type: Number,
            default: null,
        },
        moraPorcentajeAplicada: {
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
        transaccionDesembolso: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            default: null,
        },
        transaccionesPago: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Transaction',
            default: [],
        },
        estado: {
            type: String,
            enum: {
                values: ['pendiente', 'aprobada', 'rechazada', 'cancelada', 'finalizada'],
                message: 'Estado de solicitud invalido',
            },
            default: 'pendiente',
        },
        comentarioCliente: {
            type: String,
            trim: true,
            default: null,
        },
        comentarioAdmin: {
            type: String,
            trim: true,
            default: null,
        },
        aprobadoPor: {
            type: String,
            trim: true,
            default: null,
        },
        fechaAprobacion: {
            type: Date,
            default: null,
        },
        rechazadoPor: {
            type: String,
            trim: true,
            default: null,
        },
        fechaRechazo: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

creditRequestSchema.index({ usuario: 1, createdAt: -1 });
creditRequestSchema.index({ producto: 1 });
creditRequestSchema.index({ cuenta: 1 });
creditRequestSchema.index({ estado: 1 });
creditRequestSchema.index({ origenSolicitud: 1 });

export default mongoose.models.CreditRequest ||
    mongoose.model('CreditRequest', creditRequestSchema);