'use strict';
import mongoose from 'mongoose';

export const TIPOS_PRODUCTO = [
    'ahorro',
    'credito',
    'inversion',
    'servicio',
    'suscripcion',
];

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
                values: TIPOS_PRODUCTO,
                message: 'Tipo invalido',
            },
        },

        // Campos usados por productos, servicios, suscripciones, ahorro e inversion.
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
        permitePagoCuotas: {
            type: Boolean,
            default: false,
        },
        cuotasMinimas: {
            type: Number,
            default: 1,
            min: [1, 'La cantidad minima de cuotas debe ser mayor o igual a 1'],
        },
        cuotasMaximas: {
            type: Number,
            default: 1,
            min: [1, 'La cantidad maxima de cuotas debe ser mayor o igual a 1'],
        },

        // Campos usados por oportunidades de credito.
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
        requiereAprobacion: {
            type: Boolean,
            default: true,
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

productSchema.pre('validate', function validarCamposPorTipo() {
    if (this.tipo === 'credito') {
        this.precio = 0;
        this.descuentoAppPorcentaje = 0;
        this.permitePagoCuotas = false;
        this.cuotasMinimas = 1;
        this.cuotasMaximas = 1;
        this.requiereAprobacion = true;

        if (this.montoMinimo <= 0) {
            throw new Error('Una oportunidad de credito requiere monto minimo mayor que 0');
        }

        if (this.montoMaximo <= 0) {
            throw new Error('Una oportunidad de credito requiere monto maximo mayor que 0');
        }

        if (this.montoMaximo < this.montoMinimo) {
            throw new Error('El monto maximo no puede ser menor que el monto minimo');
        }

        if (this.plazoMesesMaximo < this.plazoMesesMinimo) {
            throw new Error('El plazo maximo no puede ser menor que el plazo minimo');
        }

        return;
    }

    this.montoMinimo = 0;
    this.montoMaximo = 0;
    this.tasaInteres = 0;
    this.moraPorcentaje = 0;
    this.plazoMesesMinimo = 1;
    this.plazoMesesMaximo = 1;
    this.requiereAprobacion = false;

    if (this.precio <= 0) {
        throw new Error('Este tipo de producto requiere precio mayor que 0');
    }

    if (!this.permitePagoCuotas) {
        this.cuotasMinimas = 1;
        this.cuotasMaximas = 1;
    }

    if (this.cuotasMaximas < this.cuotasMinimas) {
        throw new Error('La cantidad maxima de cuotas no puede ser menor que la minima');
    }
});

productSchema.index({ estado: 1 });
productSchema.index({ tipo: 1 });
productSchema.index({ estado: 1, tipo: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);