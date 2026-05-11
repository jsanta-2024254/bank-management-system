'use strict';

import Account from './account.model.js';
import Transaction from '../transactions/transaction.model.js';
import { generateAccountNumber } from '../../configs/accountNumber.js';

const TIPOS_CUENTA = ['monetaria', 'ahorro'];

const obtenerIdUsuarioAutenticado = (req) => {
    return req.user?.id || req.user?.sub;
};

const formatearCuenta = (account) => ({
    id: account._id,
    _id: account._id,
    numeroCuenta: account.numeroCuenta,
    tipoCuenta: account.tipoCuenta,
    saldo: account.saldo,
    usuario: account.usuario,
    usuarioId: account.usuario,
    estado: account.estado,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
});

const validarTipoCuenta = (tipoCuenta) => {
    return TIPOS_CUENTA.includes(tipoCuenta);
};

const buscarCuentaActivaPorTipo = async ({ usuario, tipoCuenta }) => {
    return Account.findOne({
        usuario,
        tipoCuenta,
        estado: true,
    });
};

const crearCuentaBancaria = async ({ usuario, tipoCuenta, saldo }) => {
    const numeroCuenta = await generateAccountNumber();

    return Account.create({
        numeroCuenta,
        tipoCuenta,
        saldo,
        usuario,
        estado: true,
    });
};

// POST /api/v1/accounts
// Uso administrativo: el admin puede crear una cuenta para un usuario y definir monto inicial.
export const createAccount = async (req, res) => {
    try {
        const { userId, usuario, tipoCuenta = 'monetaria', saldo = 0 } = req.body;
        const usuarioCuenta = String(userId || usuario || '').trim();
        const saldoInicial = Number(saldo);

        if (!usuarioCuenta) {
            return res.status(400).json({
                success: false,
                message: 'El usuario es requerido',
            });
        }

        if (!validarTipoCuenta(tipoCuenta)) {
            return res.status(400).json({
                success: false,
                message: 'tipoCuenta inválido. Valores permitidos: monetaria, ahorro',
            });
        }

        if (Number.isNaN(saldoInicial) || saldoInicial < 0) {
            return res.status(400).json({
                success: false,
                message: 'El saldo inicial debe ser un número mayor o igual a 0',
            });
        }

        const existingAccount = await buscarCuentaActivaPorTipo({
            usuario: usuarioCuenta,
            tipoCuenta,
        });

        if (existingAccount) {
            return res.status(409).json({
                success: false,
                message: `El usuario ya tiene una cuenta ${tipoCuenta} activa`,
                data: formatearCuenta(existingAccount),
            });
        }

        const account = await crearCuentaBancaria({
            usuario: usuarioCuenta,
            tipoCuenta,
            saldo: saldoInicial,
        });

        return res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: formatearCuenta(account),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear la cuenta',
            error: error.message,
        });
    }
};

// POST /api/v1/accounts/my-accounts
// Autoservicio cliente: el usuario solo puede crear su propia cuenta y siempre inicia con saldo 0.
export const createMyAccount = async (req, res) => {
    try {
        const usuarioCuenta = obtenerIdUsuarioAutenticado(req);
        const { tipoCuenta = 'monetaria' } = req.body;

        if (!usuarioCuenta) {
            return res.status(401).json({
                success: false,
                message: 'No se pudo identificar al usuario autenticado',
            });
        }

        if (!validarTipoCuenta(tipoCuenta)) {
            return res.status(400).json({
                success: false,
                message: 'tipoCuenta inválido. Valores permitidos: monetaria, ahorro',
            });
        }

        const existingAccount = await buscarCuentaActivaPorTipo({
            usuario: usuarioCuenta,
            tipoCuenta,
        });

        if (existingAccount) {
            return res.status(409).json({
                success: false,
                message: `Ya tienes una cuenta ${tipoCuenta} activa`,
                data: formatearCuenta(existingAccount),
            });
        }

        const account = await crearCuentaBancaria({
            usuario: usuarioCuenta,
            tipoCuenta,
            saldo: 0,
        });

        return res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: formatearCuenta(account),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear tu cuenta',
            error: error.message,
        });
    }
};

// PUT /api/v1/accounts/:id
// Solo admin.
export const updateAccount = async (req, res) => {
    try {
        const { tipoCuenta, saldo, estado } = req.body;
        const updates = {};

        if (tipoCuenta !== undefined) {
            if (!validarTipoCuenta(tipoCuenta)) {
                return res.status(400).json({
                    success: false,
                    message: 'tipoCuenta inválido. Valores permitidos: monetaria, ahorro',
                });
            }

            updates.tipoCuenta = tipoCuenta;
        }

        if (saldo !== undefined) {
            const saldoCuenta = Number(saldo);

            if (Number.isNaN(saldoCuenta) || saldoCuenta < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El saldo debe ser un número mayor o igual a 0',
                });
            }

            updates.saldo = saldoCuenta;
        }

        if (estado !== undefined) {
            updates.estado = estado === true || estado === 'true';
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos válidos para actualizar',
            });
        }

        const account = await Account.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cuenta actualizada exitosamente',
            data: formatearCuenta(account),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la cuenta',
            error: error.message,
        });
    }
};

// DELETE /api/v1/accounts/:id
// Solo admin. Desactiva la cuenta, no la elimina físicamente.
export const deleteAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(
            req.params.id,
            { $set: { estado: false } },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cuenta desactivada exitosamente',
            data: formatearCuenta(account),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al desactivar la cuenta',
            error: error.message,
        });
    }
};

// GET /api/v1/accounts/:id/balance
export const getBalance = async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            estado: true,
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada',
            });
        }

        if (
            req.user?.role === 'USER_ROLE' &&
            account.usuario.toString() !== obtenerIdUsuarioAutenticado(req)
        ) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver esta cuenta',
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: account._id,
                numeroCuenta: account.numeroCuenta,
                tipoCuenta: account.tipoCuenta,
                saldo: account.saldo,
                usuarioId: account.usuario,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el saldo',
            error: error.message,
        });
    }
};

// GET /api/v1/accounts/top-movements?order=desc&limit=10
export const getTopMovements = async (req, res) => {
    try {
        const { order = 'desc', limit = 10 } = req.query;
        const sortOrder = order === 'asc' ? 1 : -1;

        const result = await Transaction.aggregate([
            {
                $facet: {
                    comoOrigen: [
                        { $match: { cuentaOrigen: { $ne: null } } },
                        {
                            $group: {
                                _id: '$cuentaOrigen',
                                movimientos: { $sum: 1 },
                                monto: { $sum: '$monto' },
                            },
                        },
                    ],
                    comoDestino: [
                        { $match: { cuentaDestino: { $ne: null } } },
                        {
                            $group: {
                                _id: '$cuentaDestino',
                                movimientos: { $sum: 1 },
                                monto: { $sum: '$monto' },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    all: { $concatArrays: ['$comoOrigen', '$comoDestino'] },
                },
            },
            { $unwind: '$all' },
            {
                $group: {
                    _id: '$all._id',
                    totalMovimientos: { $sum: '$all.movimientos' },
                    totalMonto: { $sum: '$all.monto' },
                },
            },
            { $sort: { totalMovimientos: sortOrder } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'accounts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'cuenta',
                },
            },
            { $unwind: { path: '$cuenta', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    cuentaId: '$_id',
                    numeroCuenta: '$cuenta.numeroCuenta',
                    tipoCuenta: '$cuenta.tipoCuenta',
                    saldo: '$cuenta.saldo',
                    usuarioId: '$cuenta.usuario',
                    totalMovimientos: 1,
                    totalMonto: 1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            order,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas con más movimientos',
            error: error.message,
        });
    }
};

// GET /api/v1/accounts/my-accounts
export const getMyAccounts = async (req, res) => {
    try {
        const query =
            req.user.role === 'ADMIN_ROLE'
                ? { estado: true }
                : { usuario: obtenerIdUsuarioAutenticado(req), estado: true };

        const accounts = await Account.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: accounts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas',
            error: error.message,
        });
    }
};