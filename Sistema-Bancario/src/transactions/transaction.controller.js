'use strict';
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
            .populate('ejecutadaPor', 'nombre username')
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
            .populate('cuentaOrigen', 'numeroCuenta tipoCuenta')
            .populate('cuentaDestino', 'numeroCuenta tipoCuenta')
            .populate('ejecutadaPor', 'nombre username');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaccion no encontrada'
            });
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
    try {
        const { numeroCuentaDestino, tipoCuentaDestino, monto, descripcion } = req.body;

        // Validar monto maximo por transferencia
        if (monto > 2000) {
            return res.status(400).json({
                success: false,
                message: 'No puede transferir mas de Q2,000 por operacion'
            });
        }

        // Obtener cuenta origen del cliente autenticado
        const cuentaOrigen = await Account.findOne({ usuario: req.user.id, estado: true });
        if (!cuentaOrigen) {
            return res.status(404).json({
                success: false,
                message: 'No tienes una cuenta bancaria activa'
            });
        }

        // Verificar saldo suficiente
        if (cuentaOrigen.saldo < monto) {
            return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente para realizar la transferencia'
            });
        }

        // Obtener cuenta destino
        const cuentaDestino = await Account.findOne({
            numeroCuenta: numeroCuentaDestino,
            tipoCuenta: tipoCuentaDestino,
            estado: true
        });
        if (!cuentaDestino) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta destino no encontrada o inactiva'
            });
        }

        // No puede transferirse a si mismo
        if (cuentaOrigen._id.toString() === cuentaDestino._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'No puedes transferir a tu propia cuenta'
            });
        }

        // Verificar limite diario
        const hoy = new Date().toISOString().split('T')[0];
        let dailyLimit = await DailyLimit.findOne({ usuario: req.user.id, fecha: hoy });

        const totalHoy = dailyLimit ? dailyLimit.totalTransferido : 0;
        if (totalHoy + monto > 10000) {
            return res.status(400).json({
                success: false,
                message: `Limite diario excedido. Disponible hoy: Q${(10000 - totalHoy).toFixed(2)}`
            });
        }

        // Ejecutar transferencia
        const saldoAnteriorOrigen  = cuentaOrigen.saldo;
        const saldoAnteriorDestino = cuentaDestino.saldo;

        cuentaOrigen.saldo  -= monto;
        cuentaDestino.saldo += monto;

        await cuentaOrigen.save();
        await cuentaDestino.save();

        // Registrar transaccion
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
        await transaction.save();

        // Actualizar limite diario
        if (dailyLimit) {
            dailyLimit.totalTransferido += monto;
            await dailyLimit.save();
        } else {
            await DailyLimit.create({
                usuario: req.user.id,
                fecha: hoy,
                totalTransferido: monto
            });
        }

        res.status(201).json({
            success: true,
            message: 'Transferencia realizada exitosamente',
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al realizar la transferencia',
            error: error.message
        });
    }
};