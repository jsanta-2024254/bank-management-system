'use strict';
import Account from './account.model.js';
import Transaction from '../transactions/transaction.model.js';

// GET /api/v1/accounts/:id/balance
export const getBalance = async (req, res) => {
    try {
        const account = await Account.findOne({ _id: req.params.id, estado: true });

        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        }

        // Si es cliente, solo puede ver su propia cuenta
        if (req.user?.role === 'USER_ROLE' && account.usuario.toString() !== req.user.sub) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta cuenta' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: account._id,
                numeroCuenta: account.numeroCuenta,
                tipoCuenta: account.tipoCuenta,
                saldo: account.saldo,
                usuarioId: account.usuario
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el saldo', error: error.message });
    }
};

// GET /api/v1/accounts/top-movements?order=desc&limit=10
// Solo ADMIN_ROLE. Agrupa por cuenta origen y ordena por cantidad de movimientos.
export const getTopMovements = async (req, res) => {
    try {
        const { order = 'desc', limit = 10 } = req.query;
        const sortOrder = order === 'asc' ? 1 : -1;

        // Agrupa transacciones por cuenta (origen o destino) y movimientos
        const result = await Transaction.aggregate([
            // Incluir tanto cuentas origen como destino
            {
                $facet: {
                    comoOrigen: [
                        { $match: { cuentaOrigen: { $ne: null } } },
                        { $group: { _id: '$cuentaOrigen', movimientos: { $sum: 1 }, monto: { $sum: '$monto' } } }
                    ],
                    comoDestino: [
                        { $match: { cuentaDestino: { $ne: null } } },
                        { $group: { _id: '$cuentaDestino', movimientos: { $sum: 1 }, monto: { $sum: '$monto' } } }
                    ]
                }
            },
            {
                $project: {
                    all: { $concatArrays: ['$comoOrigen', '$comoDestino'] }
                }
            },
            { $unwind: '$all' },
            // Agrupar por _id de cuenta sumando los movimientos de origen y destino
            {
                $group: {
                    _id: '$all._id',
                    totalMovimientos: { $sum: '$all.movimientos' },
                    totalMonto: { $sum: '$all.monto' }
                }
            },
            { $sort: { totalMovimientos: sortOrder } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'accounts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'cuenta'
                }
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
                    totalMonto: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            order,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas con más movimientos',
            error: error.message
        });
    }
};

// GET /api/v1/accounts/my-accounts  – Cuentas del cliente autenticado
export const getMyAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ usuario: req.user.sub, estado: true });

        res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener las cuentas', error: error.message });
    }
};