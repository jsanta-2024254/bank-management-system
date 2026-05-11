'use strict';
import mongoose from 'mongoose';
import Deposit from './deposit.model.js';
import Account from '../accounts/account.model.js';
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

const obtenerCuentaActiva = async ({ numeroCuenta, tipoCuenta, session }) => {
  const account = await Account.findOne({
    numeroCuenta,
    tipoCuenta,
    estado: true,
  }).session(session);

  if (!account) {
    throw crearErrorHttp(404, 'Cuenta no encontrada o inactiva');
  }

  return account;
};

const obtenerDepositoConCuenta = async ({ depositId, session }) => {
  const deposit = await Deposit.findById(depositId).session(session);

  if (!deposit) {
    throw crearErrorHttp(404, 'Deposito no encontrado');
  }

  const account = await Account.findById(deposit.cuenta).session(session);

  if (!account || !account.estado) {
    throw crearErrorHttp(404, 'Cuenta no encontrada o inactiva');
  }

  return { deposit, account };
};

const validarDepositoReversible = (deposit) => {
  if (deposit.revertido) {
    throw crearErrorHttp(400, 'Este deposito ya fue revertido');
  }

  if (new Date() > deposit.reversibleHasta) {
    throw crearErrorHttp(
      400,
      'El tiempo para revertir este deposito ha expirado (maximo 1 minuto)'
    );
  }
};

const crearDepositoConHistorial = async ({ account, montoNum, descripcion, adminId, session }) => {
  const saldoAnterior = Number(account.saldo || 0);
  account.saldo = saldoAnterior + montoNum;
  await account.save({ session });

  const reversibleHasta = new Date(Date.now() + 60 * 1000);
  const descripcionDeposito = descripcion || 'Deposito administrativo';

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

  return {
    deposit,
    reversibleHasta,
  };
};

const revertirDepositoConHistorial = async ({ deposit, account, adminId, session }) => {
  const saldoAnterior = Number(account.saldo || 0);
  const montoActual = Number(deposit.montoActual || 0);

  if (saldoAnterior < montoActual) {
    throw crearErrorHttp(400, 'Saldo insuficiente para revertir el deposito');
  }

  account.saldo = saldoAnterior - montoActual;
  await account.save({ session });

  deposit.revertido = true;
  await deposit.save({ session });

  await Transaction.create(
    [
      {
        tipo: 'reversion',
        monto: montoActual,
        descripcion: `Reversion de deposito #${deposit._id}`,
        cuentaOrigen: account._id,
        cuentaDestino: null,
        saldoAnteriorOrigen: saldoAnterior,
        saldoPosteriorOrigen: account.saldo,
        ejecutadaPor: adminId,
      },
    ],
    { session }
  );

  return deposit;
};

const responderError = (res, error, mensajeGenerico) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? mensajeGenerico : error.message,
    ...(error.error ? { error: error.error } : {}),
    ...(statusCode === 500 ? { error: error.message } : {}),
  });
};

// POST /api/v1/admin/deposits
export const createDeposit = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      throw crearErrorHttp(
        401,
        'No se pudo identificar al administrador desde el token',
        'req.user.id / req.user.Id no existe. Revisa verifyToken middleware.'
      );
    }

    const { numeroCuenta, tipoCuenta, monto, descripcion } = req.body;
    const montoNum = obtenerMontoNumerico(monto);

    session.startTransaction();

    const account = await obtenerCuentaActiva({
      numeroCuenta,
      tipoCuenta,
      session,
    });

    const { deposit, reversibleHasta } = await crearDepositoConHistorial({
      account,
      montoNum,
      descripcion,
      adminId,
      session,
    });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: 'Deposito realizado exitosamente',
      data: deposit,
      reversibleHasta,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return responderError(res, error, 'Error al realizar el deposito');
  } finally {
    await session.endSession();
  }
};

// GET /api/v1/admin/deposits
export const getDeposits = async (req, res) => {
  try {
    const pageNum = Number(req.query.page ?? 1);
    const limitNum = Number(req.query.limit ?? 10);
    const { revertido } = req.query;

    const filter = {};
    if (revertido !== undefined) filter.revertido = revertido === 'true';

    const deposits = await Deposit.find(filter)
      .populate('cuenta', 'numeroCuenta tipoCuenta saldo')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    const total = await Deposit.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: deposits,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los depositos',
      error: error.message,
    });
  }
};

// PUT /api/v1/admin/deposits/:id
export const updateDeposit = async (req, res) => {
  try {
    const { monto } = req.body;
    const montoNum = Number(monto);

    if (!Number.isFinite(montoNum) || montoNum < 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido',
        error: 'El monto debe ser numérico y mayor que 0',
      });
    }

    const deposit = await Deposit.findById(req.params.id).populate('cuenta');
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposito no encontrado',
      });
    }

    if (deposit.revertido) {
      return res.status(400).json({
        success: false,
        message: 'No se puede modificar un deposito revertido',
      });
    }

    if (new Date() > deposit.reversibleHasta) {
      return res.status(400).json({
        success: false,
        message:
          'El tiempo para modificar este deposito ha expirado (maximo 1 minuto)',
      });
    }

    // Ajustar saldo: restar monto anterior y sumar monto nuevo
    const diferencia = montoNum - deposit.montoActual;
    const account = deposit.cuenta;

    if (Number(account.saldo) + diferencia < 0) {
      return res.status(400).json({
        success: false,
        message: 'El nuevo monto generaria saldo negativo en la cuenta',
      });
    }

    account.saldo = Number(account.saldo) + diferencia;
    await account.save();

    deposit.montoActual = montoNum;
    await deposit.save();

    return res.status(200).json({
      success: true,
      message: 'Deposito actualizado exitosamente',
      data: deposit,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Error al actualizar el deposito',
      error: error.message,
    });
  }
};

// POST /api/v1/admin/deposits/:id/revert
export const revertDeposit = async (req, res) => {
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

    const { deposit, account } = await obtenerDepositoConCuenta({
      depositId: req.params.id,
      session,
    });

    validarDepositoReversible(deposit);

    const depositRevertido = await revertirDepositoConHistorial({
      deposit,
      account,
      adminId,
      session,
    });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Deposito revertido exitosamente',
      data: depositRevertido,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return responderError(res, error, 'Error al revertir el deposito');
  } finally {
    await session.endSession();
  }
};