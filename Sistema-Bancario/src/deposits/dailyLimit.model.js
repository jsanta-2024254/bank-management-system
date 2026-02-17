'use strict';
import mongoose from 'mongoose';

const dailyLimitSchema = mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'El usuario es requerido']
        },
        fecha: {
            type: String,  // formato YYYY-MM-DD
            required: [true, 'La fecha es requerida']
        },
        totalTransferido: {
            type: Number,
            default: 0.00,
            min: [0, 'El total no puede ser negativo']
        },
        limiteDiario: {
            type: Number,
            default: 10000.00
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

dailyLimitSchema.index({ usuario: 1, fecha: 1 }, { unique: true });

export default mongoose.model('DailyLimit', dailyLimitSchema);