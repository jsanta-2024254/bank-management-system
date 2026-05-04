'use strict';
import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { User } from './user-model.js';

export const ClientProfile = sequelize.define(
    'ClientProfile',
    {
        Id: {
            type: DataTypes.STRING(16),
            primaryKey: true,
            field: 'id',
            defaultValue: () => generateUserId(),
        },
        UserId: {
            type: DataTypes.STRING(16),
            allowNull: false,
            unique: true,
            field: 'user_id',
            references: { model: User, key: 'id' },
        },
        Dpi: {
            type: DataTypes.STRING(13),
            allowNull: false,
            field: 'dpi',
            validate: {
                len: { args: [13, 13], msg: 'El DPI debe tener exactamente 13 dígitos.' },
                isNumeric: { msg: 'El DPI solo debe contener dígitos.' },
            },
        },
        Direccion: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'direccion',
            validate: {
                notEmpty: { msg: 'La dirección es obligatoria.' },
            },
        },
        NombreTrabajo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'nombre_trabajo',
            validate: {
                notEmpty: { msg: 'El nombre de trabajo es obligatorio.' },
            },
        },
        IngresosMensuales: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'ingresos_mensuales',
            validate: {
                min: { args: [100], msg: 'Los ingresos mensuales deben ser al menos Q100.' },
            },
        },
        CreatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at',
        },
        UpdatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at',
        },
    },
    {
        tableName: 'client_profiles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

// Associations
User.hasOne(ClientProfile, { foreignKey: 'user_id', as: 'ClientProfile' });
ClientProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });