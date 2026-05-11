'use strict';
import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
    {
        tipo: {
            type: String,
            required: [true, 'El tipo de transaccion es requerido'],
            enum: {
                values: ['deposito', 'transferencia', 'compra', 'credito', 'reversion'],
                message: 'Tipo de transaccion invalido'
            }
        },
        monto: {
            type: Number,
            required: [true, 'El monto es requerido'],
            min: [0.01, 'El monto debe ser mayor que 0']
        },
        descripcion: {
            type: String,
            trim: true,
            maxLength: [300, 'La descripcion no puede exceder 300 caracteres'],
            default: null
        },
        cuentaOrigen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null
        },
        cuentaDestino: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null
        },
        saldoAnteriorOrigen: {
            type: Number,
            default: null
        },
        saldoPosteriorOrigen: {
            type: Number,
            default: null
        },
        saldoAnteriorDestino: {
            type: Number,
            default: null
        },
        saldoPosteriorDestino: {
            type: Number,
            default: null
        },
        estado: {
            type: String,
            enum: {
                values: ['completada', 'revertida'],
                message: 'Estado invalido'
            },
            default: 'completada'
        },
        ejecutadaPor: {
            type: String,   // ID de Sequelize (usr_xxxx)
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

transactionSchema.index({ cuentaOrigen: 1, createdAt: -1 });
transactionSchema.index({ cuentaDestino: 1, createdAt: -1 });
transactionSchema.index({ tipo: 1 });
transactionSchema.index({ estado: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);