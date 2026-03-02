'use strict';
import mongoose from 'mongoose';
import Transaction from './transaction.model.js';
import Account from '../accounts/account.model.js';
import DailyLimit from '../deposits/dailyLimit.model.js';

// GET /api/transactions/account/:accountId
export const getAccountHistory = async (req, res) => {
    try {
        const { accountId } = req.params;
        const { page = 1, limit = 10, tipo } = req.query;

        const account = await Account.findOne({ _id: accountId, estado: true });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // El cliente solo puede ver su propia cuenta
        if (req.user.rol === 'cliente' && account.usuario.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver esta cuenta'
            });
        }

        const filter = {
            $or: [{ cuentaOrigen: accountId }, { cuentaDestino: accountId }]
        };
        if (tipo) filter.tipo = tipo;

        const transactions = await Transaction.find(filter)
            .populate('cuentaOrigen', 'numeroCuenta tipoCuenta')
            .populate('cuentaDestino', 'numeroCuenta tipoCuenta')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Transaction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: transactions,
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
            message: 'Error al obtener el historial',
            error: error.message
        });
    }
};

// GET /api/transactions/:id
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('cuentaOrigen', 'numeroCuenta tipoCuenta usuario')
            .populate('cuentaDestino', 'numeroCuenta tipoCuenta usuario')
            .populate('ejecutadaPor', 'nombre username');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaccion no encontrada'
            });
        }

        if (req.user.rol === 'cliente') {
            const uid = req.user.id;
            const esOrigen  = transaction.cuentaOrigen?.usuario?.toString() === uid;
            const esDestino = transaction.cuentaDestino?.usuario?.toString() === uid;

            if (!esOrigen && !esDestino) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para ver esta transaccion'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la transaccion',
            error: error.message
        });
    }
};

// POST /api/transactions/transfer
export const transfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { numeroCuentaDestino, tipoCuentaDestino, tipoCuentaOrigen, monto, descripcion } = req.body;

        if (monto > 2000) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'No puede transferir mas de Q2,000 por operacion'
            });
        }

        const filtroOrigen = { usuario: req.user.id, estado: true };
        if (tipoCuentaOrigen) {
            filtroOrigen.tipoCuenta = tipoCuentaOrigen;
        }

        const cuentaOrigen = await Account.findOne(filtroOrigen).session(session);

        if (!cuentaOrigen) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: tipoCuentaOrigen
                    ? `No tienes una cuenta de tipo "${tipoCuentaOrigen}" activa`
                    : 'No tienes una cuenta bancaria activa'
            });
        }

        if (cuentaOrigen.saldo < monto) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente para realizar la transferencia'
            });
        }

        const cuentaDestino = await Account.findOne({
            numeroCuenta: numeroCuentaDestino,
            tipoCuenta: tipoCuentaDestino,
            estado: true
        }).session(session);

        if (!cuentaDestino) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Cuenta destino no encontrada o inactiva'
            });
        }

        if (cuentaOrigen._id.toString() === cuentaDestino._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'No puedes transferir a tu propia cuenta'
            });
        }

        const hoy = new Date().toISOString().split('T')[0];
        let dailyLimit = await DailyLimit.findOne(
            { usuario: req.user.id, fecha: hoy }
        ).session(session);

        const totalHoy = dailyLimit ? dailyLimit.totalTransferido : 0;
        if (totalHoy + monto > 10000) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Limite diario excedido. Disponible hoy: Q${(10000 - totalHoy).toFixed(2)}`
            });
        }

        const saldoAnteriorOrigen  = cuentaOrigen.saldo;
        const saldoAnteriorDestino = cuentaDestino.saldo;

        cuentaOrigen.saldo  -= monto;
        cuentaDestino.saldo += monto;

        await cuentaOrigen.save({ session });
        await cuentaDestino.save({ session });

        const transaction = new Transaction({
            tipo: 'transferencia',
            monto,
            descripcion: descripcion || 'Transferencia bancaria',
            cuentaOrigen: cuentaOrigen._id,
            cuentaDestino: cuentaDestino._id,
            saldoAnteriorOrigen,
            saldoPosteriorOrigen: cuentaOrigen.saldo,
            saldoAnteriorDestino,
            saldoPosteriorDestino: cuentaDestino.saldo,
            ejecutadaPor: req.user.id
        });
        await transaction.save({ session });

        if (dailyLimit) {
            dailyLimit.totalTransferido += monto;
            await dailyLimit.save({ session });
        } else {
            await DailyLimit.create(
                [{ usuario: req.user.id, fecha: hoy, totalTransferido: monto }],
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Transferencia realizada exitosamente',
            data: transaction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Error al realizar la transferencia',
            error: error.message
        });
    }
};