'use strict';
import mongoose from 'mongoose';
import Favorite from './favorite.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';
import DailyLimit from '../deposits/dailyLimit.model.js';

const TRANSFER_MAX = 2000;
const DAILY_MAX = 10000;
const TIPOS_CUENTA = ['monetaria', 'ahorro'];

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

const validarTipoCuenta = (tipoCuenta) => {
    return TIPOS_CUENTA.includes(tipoCuenta);
};

const validarLimitePorOperacion = (montoNumerico) => {
    if (montoNumerico > TRANSFER_MAX) {
        throw crearErrorHttp(
            400,
            `No puede transferir mas de Q${TRANSFER_MAX.toLocaleString()} por operacion`
        );
    }
};

const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

const obtenerCuentaDestinoFavorita = async ({ favoriteId, usuario, session }) => {
    const favorite = await Favorite.findOne({ _id: favoriteId, usuario })
        .populate('cuenta')
        .session(session);

    if (!favorite) {
        throw crearErrorHttp(404, 'Favorito no encontrado');
    }

    const cuentaDestino = favorite.cuenta;

    if (!cuentaDestino || !cuentaDestino.estado) {
        throw crearErrorHttp(
            400,
            'La cuenta favorita esta inactiva y no puede recibir transferencias'
        );
    }

    return { favorite, cuentaDestino };
};

const obtenerCuentaOrigen = async ({ usuario, tipoCuentaOrigen, session }) => {
    if (!validarTipoCuenta(tipoCuentaOrigen)) {
        throw crearErrorHttp(
            400,
            'tipoCuentaOrigen invalido. Valores permitidos: monetaria, ahorro'
        );
    }

    const cuentaOrigen = await Account.findOne({
        usuario,
        tipoCuenta: tipoCuentaOrigen,
        estado: true,
    }).session(session);

    if (!cuentaOrigen) {
        throw crearErrorHttp(
            404,
            `No tienes una cuenta ${tipoCuentaOrigen} activa para realizar la transferencia`
        );
    }

    return cuentaOrigen;
};

const validarTransferencia = ({ cuentaOrigen, cuentaDestino, montoNumerico }) => {
    if (cuentaOrigen._id.toString() === cuentaDestino._id.toString()) {
        throw crearErrorHttp(400, 'No puedes transferir a la misma cuenta');
    }

    if (Number(cuentaOrigen.saldo) < montoNumerico) {
        throw crearErrorHttp(400, 'Saldo insuficiente para realizar la transferencia');
    }
};

const validarYActualizarLimiteDiario = async ({ usuario, montoNumerico, session }) => {
    const fechaActual = obtenerFechaActual();
    let dailyLimit = await DailyLimit.findOne({ usuario, fecha: fechaActual }).session(session);
    const totalHoy = dailyLimit ? Number(dailyLimit.totalTransferido || 0) : 0;

    if (totalHoy + montoNumerico > DAILY_MAX) {
        throw crearErrorHttp(
            400,
            `Limite diario excedido. Disponible: Q${(DAILY_MAX - totalHoy).toFixed(2)}`
        );
    }

    if (dailyLimit) {
        dailyLimit.totalTransferido = totalHoy + montoNumerico;
        await dailyLimit.save({ session });
        return dailyLimit;
    }

    [dailyLimit] = await DailyLimit.create(
        [
            {
                usuario,
                fecha: fechaActual,
                totalTransferido: montoNumerico,
            },
        ],
        { session }
    );

    return dailyLimit;
};

const aplicarMovimientoSaldos = async ({ cuentaOrigen, cuentaDestino, montoNumerico, session }) => {
    const saldoAnteriorOrigen = Number(cuentaOrigen.saldo || 0);
    const saldoAnteriorDestino = Number(cuentaDestino.saldo || 0);

    cuentaOrigen.saldo = saldoAnteriorOrigen - montoNumerico;
    cuentaDestino.saldo = saldoAnteriorDestino + montoNumerico;

    await cuentaOrigen.save({ session });
    await cuentaDestino.save({ session });

    return {
        saldoAnteriorOrigen,
        saldoPosteriorOrigen: cuentaOrigen.saldo,
        saldoAnteriorDestino,
        saldoPosteriorDestino: cuentaDestino.saldo,
    };
};

const registrarTransferenciaFavorita = async ({
    favorite,
    cuentaOrigen,
    cuentaDestino,
    montoNumerico,
    descripcion,
    usuario,
    saldos,
    session,
}) => {
    const [transaction] = await Transaction.create(
        [
            {
                tipo: 'transferencia',
                monto: montoNumerico,
                descripcion: descripcion || `Transferencia a favorito: ${favorite.alias}`,
                cuentaOrigen: cuentaOrigen._id,
                cuentaDestino: cuentaDestino._id,
                saldoAnteriorOrigen: saldos.saldoAnteriorOrigen,
                saldoPosteriorOrigen: saldos.saldoPosteriorOrigen,
                saldoAnteriorDestino: saldos.saldoAnteriorDestino,
                saldoPosteriorDestino: saldos.saldoPosteriorDestino,
                ejecutadaPor: usuario,
            },
        ],
        { session }
    );

    return transaction;
};

const responderError = (res, error, mensajeGenerico) => {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? mensajeGenerico : error.message,
        ...(statusCode === 500 ? { error: error.message } : {}),
    });
};

// GET /api/favorites
export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ usuario: req.user.id })
            .populate({
                path: 'cuenta',
                select: 'numeroCuenta tipoCuenta saldo estado',
                match: { estado: true },
            })
            .sort({ createdAt: -1 });

        const activeFavorites = favorites.filter((favorite) => favorite.cuenta !== null);

        res.status(200).json({
            success: true,
            data: activeFavorites,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los favoritos',
            error: error.message,
        });
    }
};

// POST /api/favorites
export const addFavorite = async (req, res) => {
    try {
        const { numeroCuenta, tipoCuenta, alias } = req.body;

        const account = await Account.findOne({ numeroCuenta, tipoCuenta, estado: true });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada o inactiva',
            });
        }

        if (account.usuario.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'No puedes agregar tu propia cuenta como favorita',
            });
        }

        const favorite = new Favorite({
            usuario: req.user.id,
            cuenta: account._id,
            alias,
            numeroCuenta,
            tipoCuenta,
        });
        await favorite.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta agregada a favoritos exitosamente',
            data: favorite,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Esta cuenta ya esta en tus favoritos',
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al agregar favorito',
            error: error.message,
        });
    }
};

// PUT /api/favorites/:id
export const updateFavorite = async (req, res) => {
    try {
        const { alias } = req.body;
        const favorite = await Favorite.findOneAndUpdate(
            { _id: req.params.id, usuario: req.user.id },
            { $set: { alias } },
            { new: true, runValidators: true }
        );

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Alias actualizado exitosamente',
            data: favorite,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el favorito',
            error: error.message,
        });
    }
};

// DELETE /api/favorites/:id
export const deleteFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findOneAndDelete({
            _id: req.params.id,
            usuario: req.user.id,
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Favorito eliminado exitosamente',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el favorito',
            error: error.message,
        });
    }
};

// POST /api/favorites/:id/transfer
export const transferToFavorite = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { monto, descripcion, tipoCuentaOrigen } = req.body;
        const montoNumerico = obtenerMontoNumerico(monto);

        validarLimitePorOperacion(montoNumerico);

        session.startTransaction();

        const { favorite, cuentaDestino } = await obtenerCuentaDestinoFavorita({
            favoriteId: req.params.id,
            usuario: req.user.id,
            session,
        });

        const cuentaOrigen = await obtenerCuentaOrigen({
            usuario: req.user.id,
            tipoCuentaOrigen,
            session,
        });

        validarTransferencia({
            cuentaOrigen,
            cuentaDestino,
            montoNumerico,
        });

        await validarYActualizarLimiteDiario({
            usuario: req.user.id,
            montoNumerico,
            session,
        });

        const saldos = await aplicarMovimientoSaldos({
            cuentaOrigen,
            cuentaDestino,
            montoNumerico,
            session,
        });

        const transaction = await registrarTransferenciaFavorita({
            favorite,
            cuentaOrigen,
            cuentaDestino,
            montoNumerico,
            descripcion,
            usuario: req.user.id,
            saldos,
            session,
        });

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'Transferencia exitosa',
            data: transaction,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        responderError(res, error, 'Error en transferencia');
    } finally {
        await session.endSession();
    }
};