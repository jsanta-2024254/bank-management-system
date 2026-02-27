'use strict';
import Deposit from './deposit.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';

// POST /api/admin/deposits
export const createDeposit = async (req, res) => {
    try {
        const { numeroCuenta, tipoCuenta, monto, descripcion } = req.body;

        const account = await Account.findOne({ numeroCuenta, tipoCuenta, estado: true });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada o inactiva'
            });
        }

        const saldoAnterior = account.saldo;
        account.saldo += monto;
        await account.save();

        // Ventana de reversion: 1 minuto
        const reversibleHasta = new Date(Date.now() + 60 * 1000);

        const deposit = new Deposit({
            cuenta: account._id,
            montoOriginal: monto,
            montoActual: monto,
            descripcion: descripcion || 'Deposito administrativo',
            admin: req.user.id,
            reversibleHasta
        });
        await deposit.save();

        // Registrar transaccion en historial
        const transaction = new Transaction({
            tipo: 'deposito',
            monto,
            descripcion: deposit.descripcion,
            cuentaOrigen: null,
            cuentaDestino: account._id,
            saldoAnteriorDestino: saldoAnterior,
            saldoPosteriorDestino: account.saldo,
            ejecutadaPor: req.user.id
        });
        await transaction.save();

        deposit.transaccion = transaction._id;
        await deposit.save();

        res.status(201).json({
            success: true,
            message: 'Deposito realizado exitosamente',
            data: deposit,
            reversibleHasta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al realizar el deposito',
            error: error.message
        });
    }
};

// GET /api/admin/deposits
export const getDeposits = async (req, res) => {
    try {
        const { page = 1, limit = 10, revertido } = req.query;
        const filter = {};
        if (revertido !== undefined) filter.revertido = revertido === 'true';

        const deposits = await Deposit.find(filter)
            .populate('cuenta', 'numeroCuenta tipoCuenta saldo')
            .populate('admin', 'nombre username')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Deposit.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: deposits,
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
            message: 'Error al obtener los depositos',
            error: error.message
        });
    }
};

// PUT /api/admin/deposits/:id
export const updateDeposit = async (req, res) => {
    try {
        const { monto } = req.body;
        const deposit = await Deposit.findById(req.params.id).populate('cuenta');

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: 'Deposito no encontrado'
            });
        }

        if (deposit.revertido) {
            return res.status(400).json({
                success: false,
                message: 'No se puede modificar un deposito revertido'
            });
        }

        if (new Date() > deposit.reversibleHasta) {
            return res.status(400).json({
                success: false,
                message: 'El tiempo para modificar este deposito ha expirado (maximo 1 minuto)'
            });
        }

        // Ajustar saldo: restar monto anterior y sumar monto nuevo
        const diferencia = monto - deposit.montoActual;
        const account = deposit.cuenta;

        if (account.saldo + diferencia < 0) {
            return res.status(400).json({
                success: false,
                message: 'El nuevo monto generaria saldo negativo en la cuenta'
            });
        }

        account.saldo += diferencia;
        await account.save();

        deposit.montoActual = monto;
        await deposit.save();

        res.status(200).json({
            success: true,
            message: 'Deposito actualizado exitosamente',
            data: deposit
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el deposito',
            error: error.message
        });
    }
};

// POST /api/admin/deposits/:id/revert
export const revertDeposit = async (req, res) => {
    try {
        const deposit = await Deposit.findById(req.params.id).populate('cuenta');

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: 'Deposito no encontrado'
            });
        }

        if (deposit.revertido) {
            return res.status(400).json({
                success: false,
                message: 'Este deposito ya fue revertido'
            });
        }

        // Verificar ventana de 1 minuto
        if (new Date() > deposit.reversibleHasta) {
            return res.status(400).json({
                success: false,
                message: 'El tiempo para revertir este deposito ha expirado (maximo 1 minuto)'
            });
        }

        const account = deposit.cuenta;
        const saldoAnterior = account.saldo;

        if (account.saldo < deposit.montoActual) {
            return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente para revertir el deposito'
            });
        }

        account.saldo -= deposit.montoActual;
        await account.save();

        deposit.revertido = true;
        await deposit.save();

        await Transaction.create({
            tipo: 'reversion',
            monto: deposit.montoActual,
            descripcion: `Reversion de deposito #${deposit._id}`,
            cuentaOrigen: account._id,
            cuentaDestino: null,
            saldoAnteriorOrigen: saldoAnterior,
            saldoPosteriorOrigen: account.saldo,
            ejecutadaPor: req.user.id
        });

        res.status(200).json({
            success: true,
            message: 'Deposito revertido exitosamente',
            data: deposit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al revertir el deposito',
            error: error.message
        });
    }
};