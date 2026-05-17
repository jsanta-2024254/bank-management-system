'use strict';
import mongoose from 'mongoose';

const depositRequestSchema = mongoose.Schema(
    {
        cuenta: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'La cuenta es requerida'],
        },
        usuario: {
            type: String,
            required: [true, 'El usuario es requerido'],
            trim: true,
        },
        tipoDeposito: {
            type: String,
            required: [true, 'El tipo de depósito es requerido'],
            enum: {
                values: ['efectivo', 'cheque'],
                message: 'Tipo de depósito inválido',
            },
        },
        monto: {
            type: Number,
            required: [true, 'El monto es requerido'],
            min: [0.01, 'El monto debe ser mayor que 0'],
        },
        referencia: {
            type: String,
            trim: true,
            maxLength: [100, 'La referencia no puede exceder 100 caracteres'],
            default: null,
        },
        comentarioUsuario: {
            type: String,
            trim: true,
            maxLength: [300, 'El comentario no puede exceder 300 caracteres'],
            default: null,
        },
        estado: {
            type: String,
            enum: {
                values: ['pendiente', 'aprobada', 'rechazada'],
                message: 'Estado inválido',
            },
            default: 'pendiente',
        },
        motivoRechazo: {
            type: String,
            trim: true,
            maxLength: [300, 'El motivo no puede exceder 300 caracteres'],
            default: null,
        },
        revisadoPor: {
            type: String,
            trim: true,
            default: null,
        },
        revisadoEn: {
            type: Date,
            default: null,
        },
        deposito: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Deposit',
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

depositRequestSchema.index({ usuario: 1, createdAt: -1 });
depositRequestSchema.index({ estado: 1, createdAt: -1 });
depositRequestSchema.index({ cuenta: 1 });

export default mongoose.models.DepositRequest ||
    mongoose.model('DepositRequest', depositRequestSchema);