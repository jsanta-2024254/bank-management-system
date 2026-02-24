'use strict';
import User from './user-model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';
import { generateAccountNumber } from '../../configs/accountNumber.js';
import { hashPassword } from '../../utils/password-utils.js';

// POST /api/admin/users  
export const createUser = async (req, res) => {
    try {
        const { nombre, username, email, password, dpi, direccion, celular,
                nombreTrabajo, ingresosMensuales, tipoCuenta = 'monetaria' } = req.body;

        if (ingresosMensuales < 100) {
            return res.status(400).json({
                success: false,
                message: 'Los ingresos mensuales deben ser al menos Q100 para crear una cuenta'
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = new User({
            nombre, username, email,
            password: hashedPassword,
            dpi, direccion, celular, nombreTrabajo, ingresosMensuales,
            rol: 'cliente'
        });
        await user.save();

        const numeroCuenta = await generateAccountNumber();
        const account = new Account({
            numeroCuenta,
            tipoCuenta,
            saldo: 0,
            usuario: user._id
        });
        await account.save();

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: {
                user: { ...user.toObject(), password: undefined },
                cuenta: account
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `El ${field} ya esta registrado`
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al crear el cliente',
            error: error.message
        });
    }
};

// GET /api/admin/users  
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado = true } = req.query;
        const filter = { rol: 'cliente', estado };

        const users = await User.find(filter, { password: 0 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        const usersWithData = await Promise.all(
            users.map(async (user) => {
                const account = await Account.findOne({ usuario: user._id, estado: true });
                let lastTransactions = [];
                if (account) {
                    lastTransactions = await Transaction.find({
                        $or: [{ cuentaOrigen: account._id }, { cuentaDestino: account._id }]
                    })
                    .sort({ createdAt: -1 })
                    .limit(5);
                }
                return {
                    ...user.toObject(), 
                    cuenta: account,
                    ultimosMovimientos: lastTransactions
                };
            })
        );

        res.status(200).json({
            success: true,
            data: usersWithData,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los usuarios',
            error: error.message
        });
    }
};

// GET /api/admin/users/:id  
export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne(
            { _id: req.params.id, rol: 'cliente' },
            { password: 0 } 
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const account = await Account.findOne({ usuario: user._id, estado: true });
        let lastTransactions = [];
        if (account) {
            lastTransactions = await Transaction.find({
                $or: [{ cuentaOrigen: account._id }, { cuentaDestino: account._id }]
            })
            .sort({ createdAt: -1 })
            .limit(5);
        }

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(), 
                cuenta: account,
                ultimosMovimientos: lastTransactions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el usuario',
            error: error.message
        });
    }
};

// PUT /api/admin/users/:id  
export const updateUser = async (req, res) => {
    try {
        const { dpi, password, rol, ...allowedFields } = req.body;

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, rol: 'cliente' },
            { $set: allowedFields },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};

// DELETE /api/admin/users/:id  
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, rol: 'cliente' },
            { $set: { estado: false } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        await Account.updateMany({ usuario: user._id }, { $set: { estado: false } });

        res.status(200).json({
            success: true,
            message: 'Usuario desactivado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el usuario',
            error: error.message
        });
    }
};