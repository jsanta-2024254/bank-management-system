'use strict';
import mongoose from 'mongoose';

const favoriteSchema = mongoose.Schema(
    {
        usuario: {
            type: String,   // ID de Sequelize (usr_xxxx)
            required: [true, 'El usuario es requerido'],
            trim: true
        },
        cuenta: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'La cuenta es requerida']
        },
        alias: {
            type: String,
            required: [true, 'El alias es requerido'],
            trim: true,
            maxLength: [80, 'El alias no puede exceder 80 caracteres']
        },
        numeroCuenta: {
            type: String,
            required: [true, 'El numero de cuenta es requerido'],
            trim: true
        },
        tipoCuenta: {
            type: String,
            required: [true, 'El tipo de cuenta es requerido'],
            enum: {
                values: ['monetaria', 'ahorro'],
                message: 'Tipo de cuenta invalido'
            }
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

favoriteSchema.index({ usuario: 1 });
favoriteSchema.index({ usuario: 1, cuenta: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
