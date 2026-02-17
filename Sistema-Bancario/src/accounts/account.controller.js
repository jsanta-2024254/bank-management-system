'use strict';
import Account from './account.model.js';
import Transaction from '../transactions/transaction.model.js';

// GET /api/accounts/:id/balance 
export const getBalance = async (req, res) => {
    try {
        const account = await Account.findOne({ _id: req.params.id, estado: true })
            .populate('usuario', 'nombre username email');

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // Si es cliente, solo puede ver su propia cuenta
        if (req.user.rol === 'cliente' && account.usuario._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver esta cuenta'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                numeroCuenta: account.numeroCuenta,
                tipoCuenta: account.tipoCuenta,
                saldo: account.saldo,
                propietario: account.usuario
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el saldo',
            error: error.message
        });
    }
};

// GET /api/admin/accounts/top-movements 
export const getTopMovements = async (req, res) => {
    try {
        const { order = 'desc', limit = 10 } = req.query;
        const sortOrder = order === 'asc' ? 1 : -1;

        const result = await Transaction.aggregate([
            {
                $group: {
                    _id: '$cuentaOrigen',
                    totalMovimientos: { $sum: 1 },
                    totalMonto: { $sum: '$monto' }
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
            { $unwind: '$cuenta' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'cuenta.usuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            { $unwind: '$usuario' },
            {
                $project: {
                    numeroCuenta: '$cuenta.numeroCuenta',
                    tipoCuenta: '$cuenta.tipoCuenta',
                    saldo: '$cuenta.saldo',
                    propietario: '$usuario.nombre',
                    totalMovimientos: 1,
                    totalMonto: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: result,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas con mas movimientos',
            error: error.message
        });
    }
};