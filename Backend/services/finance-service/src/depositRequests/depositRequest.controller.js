'use strict';
import mongoose from 'mongoose';
import DepositRequest from './depositRequest.model.js';
import Account from '../accounts/account.model.js';
import Deposit from '../deposits/deposit.model.js';
import Transaction from '../transactions/transaction.model.js';

const crearErrorHttp = (statusCode, message, error = null) => {
    const httpError = new Error(message);
    httpError.statusCode = statusCode;
    httpError.error = error;
    return httpError;
};

const getAuthUserId = (req) => {
    return (
        req.userId ??
        req.user?.id ??
        req.user?.Id ??
        req.user?.dataValues?.Id ??
        req.user?.userId ??
        req.user?.UserId ??
        null
    );
};

const obtenerMontoNumerico = (monto) => {
    const montoNumerico = Number(monto);

    if (!Number.isFinite(montoNumerico) || montoNumerico < 0.01) {
        throw crearErrorHttp(
            400,
            'Monto inválido',
            'El monto debe ser numérico y mayor que 0'
        );
    }

    return montoNumerico;
};

const responderError = (res, error, mensajeGenerico) => {
    const statusCode = error.statusCode || 500;

    const response = {
        success: false,
        message: statusCode === 500 ? mensajeGenerico : error.message,
    };

    if (statusCode === 500) {
        response.error = error.message;
    } else if (error.error) {
        response.error = error.error;
    }

    return res.status(statusCode).json(response);
};

export const createDepositRequest = async (req, res) => {
    try {
        const usuarioId = getAuthUserId(req);

        if (!usuarioId) {
            throw crearErrorHttp(
                401,
                'No se pudo identificar al usuario desde el token'
            );
        }

        const { cuentaId, tipoDeposito, monto, referencia, comentarioUsuario } = req.body;
        const montoNum = obtenerMontoNumerico(monto);

        const account = await Account.findOne({
            _id: cuentaId,
            usuario: usuarioId,
            estado: true,
        });

        if (!account) {
            throw crearErrorHttp(
                404,
                'Cuenta no encontrada o no pertenece al usuario autenticado'
            );
        }

        const depositRequest = await DepositRequest.create({
            cuenta: account._id,
            usuario: usuarioId,
            tipoDeposito,
            monto: montoNum,
            referencia: referencia || null,
            comentarioUsuario: comentarioUsuario || null,
        });

        return res.status(201).json({
            success: true,
            message: 'Solicitud de depósito enviada correctamente',
            data: depositRequest,
        });
    } catch (error) {
        return responderError(res, error, 'Error al crear la solicitud de depósito');
    }
};

export const getMyDepositRequests = async (req, res) => {
    try {
        const usuarioId = getAuthUserId(req);

        if (!usuarioId) {
            throw crearErrorHttp(
                401,
                'No se pudo identificar al usuario desde el token'
            );
        }

        const requests = await DepositRequest.find({ usuario: usuarioId })
            .populate('cuenta', 'numeroCuenta tipoCuenta saldo')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        return responderError(
            res,
            error,
            'Error al obtener las solicitudes de depósito'
        );
    }
};

export const getDepositRequests = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const { estado } = req.query;

        const filter = {};

        if (estado) {
            filter.estado = estado;
        }

        const [requests, total] = await Promise.all([
            DepositRequest.find(filter)
                .populate('cuenta', 'numeroCuenta tipoCuenta saldo usuario')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            DepositRequest.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: requests,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit,
            },
        });
    } catch (error) {
        return responderError(
            res,
            error,
            'Error al obtener las solicitudes de depósito'
        );
    }
};

export const approveDepositRequest = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const adminId = getAuthUserId(req);

        if (!adminId) {
            throw crearErrorHttp(
                401,
                'No se pudo identificar al administrador desde el token'
            );
        }

        session.startTransaction();

        const depositRequest = await DepositRequest.findOne({
            _id: req.params.id,
            estado: 'pendiente',
        }).session(session);

        if (!depositRequest) {
            throw crearErrorHttp(
                404,
                'Solicitud de depósito no encontrada o ya fue revisada'
            );
        }

        const account = await Account.findOne({
            _id: depositRequest.cuenta,
            estado: true,
        }).session(session);

        if (!account) {
            throw crearErrorHttp(404, 'Cuenta no encontrada o inactiva');
        }

        const saldoAnterior = Number(account.saldo || 0);
        const montoNum = Number(depositRequest.monto || 0);

        account.saldo = saldoAnterior + montoNum;
        await account.save({ session });

        const reversibleHasta = new Date(Date.now() + 60 * 1000);

        const descripcionDeposito = `Depósito aprobado por solicitud ${depositRequest._id} (${depositRequest.tipoDeposito})`;

        const [deposit] = await Deposit.create(
            [
                {
                    cuenta: account._id,
                    montoOriginal: montoNum,
                    montoActual: montoNum,
                    descripcion: descripcionDeposito,
                    admin: adminId,
                    reversibleHasta,
                },
            ],
            { session }
        );

        const [transaction] = await Transaction.create(
            [
                {
                    tipo: 'deposito',
                    monto: montoNum,
                    descripcion: descripcionDeposito,
                    cuentaOrigen: null,
                    cuentaDestino: account._id,
                    saldoAnteriorDestino: saldoAnterior,
                    saldoPosteriorDestino: account.saldo,
                    ejecutadaPor: adminId,
                },
            ],
            { session }
        );

        deposit.transaccion = transaction._id;
        await deposit.save({ session });

        depositRequest.estado = 'aprobada';
        depositRequest.revisadoPor = adminId;
        depositRequest.revisadoEn = new Date();
        depositRequest.deposito = deposit._id;
        await depositRequest.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: 'Solicitud aprobada y depósito acreditado correctamente',
            data: depositRequest,
            deposito: deposit,
            nuevoSaldo: account.saldo,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        return responderError(
            res,
            error,
            'Error al aprobar la solicitud de depósito'
        );
    } finally {
        await session.endSession();
    }
};

export const rejectDepositRequest = async (req, res) => {
    try {
        const adminId = getAuthUserId(req);

        if (!adminId) {
            throw crearErrorHttp(
                401,
                'No se pudo identificar al administrador desde el token'
            );
        }

        const { motivoRechazo } = req.body;

        const depositRequest = await DepositRequest.findOne({
            _id: req.params.id,
            estado: 'pendiente',
        });

        if (!depositRequest) {
            throw crearErrorHttp(
                404,
                'Solicitud de depósito no encontrada o ya fue revisada'
            );
        }

        depositRequest.estado = 'rechazada';
        depositRequest.motivoRechazo =
            motivoRechazo || 'Solicitud rechazada por administración';
        depositRequest.revisadoPor = adminId;
        depositRequest.revisadoEn = new Date();

        await depositRequest.save();

        return res.status(200).json({
            success: true,
            message: 'Solicitud rechazada correctamente',
            data: depositRequest,
        });
    } catch (error) {
        return responderError(
            res,
            error,
            'Error al rechazar la solicitud de depósito'
        );
    }
};