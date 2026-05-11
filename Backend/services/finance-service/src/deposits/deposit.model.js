'use strict';
import mongoose from 'mongoose';

const depositSchema = mongoose.Schema(
    {
        cuenta: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'La cuenta es requerida']
        },
        montoOriginal: {
            type: Number,
            required: [true, 'El monto original es requerido'],
            min: [0.01, 'El monto debe ser mayor que 0']
        },
        montoActual: {
            type: Number,
            required: [true, 'El monto actual es requerido'],
            min: [0.01, 'El monto debe ser mayor que 0']
        },
        descripcion: {
            type: String,
            trim: true,
            maxLength: [300, 'La descripcion no puede exceder 300 caracteres'],
            default: 'Deposito administrativo'
        },
        admin: {
            type: String,   // ID de Sequelize (usr_xxxx)
            required: [true, 'El administrador es requerido'],
            trim: true
        },
        transaccion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            default: null
        },
        revertido: {
            type: Boolean,
            default: false
        },
        reversibleHasta: {
            type: Date,
            required: true  // createdAt + 1 minuto
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

depositSchema.index({ cuenta: 1 });
depositSchema.index({ admin: 1 });
depositSchema.index({ revertido: 1 });
depositSchema.index({ createdAt: -1 });

export default mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);