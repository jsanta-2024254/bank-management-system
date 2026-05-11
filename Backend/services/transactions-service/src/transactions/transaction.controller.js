'use strict';
import mongoose from 'mongoose';
import Transaction from './transaction.model.js';
import Account from '../accounts/account.model.js';
import DailyLimit from '../deposits/dailyLimit.model.js';

const MONTO_MAXIMO_POR_OPERACION = 2000;
const LIMITE_DIARIO_TRANSFERENCIAS = 10000;

const crearErrorHttp = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const obtenerMontoNumerico = (monto) => {
    const montoNumerico = Number(monto);

    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
        throw crearErrorHttp(400, 'El monto debe ser mayor que 0');
    }

    return montoNumerico;
};

const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

const validarLimitePorOperacion = (montoNumerico) => {
    if (montoNumerico > MONTO_MAXIMO_POR_OPERACION) {
        throw crearErrorHttp(400, 'No puede transferir mas de Q2,000 por operacion');
    }
};

const obtenerCuentaOrigen = async ({ usuario, tipoCuentaOrigen, session }) => {
    const filtroOrigen = { usuario, estado: true };

    if (tipoCuentaOrigen) {
        filtroOrigen.tipoCuenta = tipoCuentaOrigen;
    }

    const cuentaOrigen = await Account.findOne(filtroOrigen).session(session);

    if (!cuentaOrigen) {
        throw crearErrorHttp(
            404,
            tipoCuentaOrigen
                ? `No tienes una cuenta de tipo "${tipoCuentaOrigen}" activa`
                : 'No tienes una cuenta bancaria activa'
        );
    }

    return cuentaOrigen;
};

const obtenerCuentaDestino = async ({ numeroCuentaDestino, tipoCuentaDestino, session }) => {
    const cuentaDestino = await Account.findOne({
        numeroCuenta: numeroCuentaDestino,
        tipoCuenta: tipoCuentaDestino,
        estado: true
    }).session(session);

    if (!cuentaDestino) {
        throw crearErrorHttp(404, 'Cuenta destino no encontrada o inactiva');
    }

    return cuentaDestino;
};

const validarTransferenciaEntreCuentas = ({ cuentaOrigen, cuentaDestino, montoNumerico }) => {
    if (cuentaOrigen._id.toString() === cuentaDestino._id.toString()) {
        throw crearErrorHttp(400, 'No puedes transferir a la misma cuenta');
    }

    if (cuentaOrigen.saldo < montoNumerico) {
        throw crearErrorHttp(400, 'Saldo insuficiente para realizar la transferencia');
    }
};

const validarYActualizarLimiteDiario = async ({ usuario, montoNumerico, session }) => {
    const fechaActual = obtenerFechaActual();
    let limiteDiario = await DailyLimit.findOne({ usuario, fecha: fechaActual }).session(session);
    const totalTransferidoHoy = limiteDiario ? limiteDiario.totalTransferido : 0;

    if (totalTransferidoHoy + montoNumerico > LIMITE_DIARIO_TRANSFERENCIAS) {
        const disponibleHoy = LIMITE_DIARIO_TRANSFERENCIAS - totalTransferidoHoy;

        throw crearErrorHttp(
            400,
            `Limite diario excedido. Disponible hoy: Q${disponibleHoy.toFixed(2)}`
        );
    }

    if (limiteDiario) {
        limiteDiario.totalTransferido += montoNumerico;
        await limiteDiario.save({ session });
        return limiteDiario;
    }

    [limiteDiario] = await DailyLimit.create(
        [
            {
                usuario,
                fecha: fechaActual,
                totalTransferido: montoNumerico
            }
        ],
        { session }
    );

    return limiteDiario;
};

const aplicarMovimientoDeSaldos = async ({ cuentaOrigen, cuentaDestino, montoNumerico, session }) => {
    const saldoAnteriorOrigen = cuentaOrigen.saldo;
    const saldoAnteriorDestino = cuentaDestino.saldo;

    cuentaOrigen.saldo -= montoNumerico;
    cuentaDestino.saldo += montoNumerico;

    await cuentaOrigen.save({ session });
    await cuentaDestino.save({ session });

    return {
        saldoAnteriorOrigen,
        saldoPosteriorOrigen: cuentaOrigen.saldo,
        saldoAnteriorDestino,
        saldoPosteriorDestino: cuentaDestino.saldo
    };
};

const registrarTransferencia = async ({
    cuentaOrigen,
    cuentaDestino,
    montoNumerico,
    descripcion,
    ejecutadaPor,
    saldos,
    session
}) => {
    const [transaction] = await Transaction.create(
        [
            {
                tipo: 'transferencia',
                monto: montoNumerico,
                descripcion: descripcion || 'Transferencia bancaria',
                cuentaOrigen: cuentaOrigen._id,
                cuentaDestino: cuentaDestino._id,
                saldoAnteriorOrigen: saldos.saldoAnteriorOrigen,
                saldoPosteriorOrigen: saldos.saldoPosteriorOrigen,
                saldoAnteriorDestino: saldos.saldoAnteriorDestino,
                saldoPosteriorDestino: saldos.saldoPosteriorDestino,
                ejecutadaPor
            }
        ],
        { session }
    );

    return transaction;
};

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
        if (req.user.role === 'USER_ROLE' && account.usuario.toString() !== req.user.id) {
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

        if (req.user.role === 'USER_ROLE') {
            const uid = req.user.id;
            const esOrigen = transaction.cuentaOrigen?.usuario?.toString() === uid;
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

    try {
        const {
            numeroCuentaDestino,
            tipoCuentaDestino,
            tipoCuentaOrigen,
            monto,
            descripcion
        } = req.body;

        const montoNumerico = obtenerMontoNumerico(monto);
        validarLimitePorOperacion(montoNumerico);

        session.startTransaction();

        const cuentaOrigen = await obtenerCuentaOrigen({
            usuario: req.user.id,
            tipoCuentaOrigen,
            session
        });

        const cuentaDestino = await obtenerCuentaDestino({
            numeroCuentaDestino,
            tipoCuentaDestino,
            session
        });

        validarTransferenciaEntreCuentas({
            cuentaOrigen,
            cuentaDestino,
            montoNumerico
        });

        await validarYActualizarLimiteDiario({
            usuario: req.user.id,
            montoNumerico,
            session
        });

        const saldos = await aplicarMovimientoDeSaldos({
            cuentaOrigen,
            cuentaDestino,
            montoNumerico,
            session
        });

        const transaction = await registrarTransferencia({
            cuentaOrigen,
            cuentaDestino,
            montoNumerico,
            descripcion,
            ejecutadaPor: req.user.id,
            saldos,
            session
        });

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'Transferencia realizada exitosamente',
            data: transaction
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        const statusCode = error.statusCode || 500;

        res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Error al realizar la transferencia' : error.message,
            ...(statusCode === 500 ? { error: error.message } : {})
        });
    } finally {
        await session.endSession();
    }
};