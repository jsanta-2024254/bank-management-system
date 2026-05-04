'use strict';
import mongoose from 'mongoose';

const accountSchema = mongoose.Schema(
    {
        numeroCuenta: {
            type: String,
            required: [true, 'El numero de cuenta es requerido'],
            unique: true,
            trim: true
        },
        tipoCuenta: {
            type: String,
            required: [true, 'El tipo de cuenta es requerido'],
            enum: {
                values: ['monetaria', 'ahorro'],
                message: 'Tipo de cuenta invalido. Valores permitidos: monetaria, ahorro'
            }
        },
        saldo: {
            type: Number,
            default: 0.00,
            min: [0, 'El saldo no puede ser negativo']
        },
        usuario: {
            type: String,   // ID de Sequelize (ej: usr_vF5fBBwn7jsi)
            required: [true, 'El usuario es requerido'],
            trim: true
        },
        estado: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

accountSchema.index({ usuario: 1 });
accountSchema.index({ estado: 1 });
accountSchema.index({ usuario: 1, estado: 1 });

export default mongoose.models.Account || mongoose.model('Account', accountSchema);