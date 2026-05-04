'use strict';
import Deposit from './deposit.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';

// Helper: obtener ID del usuario
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

// POST /api/v1/admin/deposits
export const createDeposit = async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'No se pudo identificar al administrador desde el token',
        error:
          'req.user.id / req.user.Id no existe. Revisa verifyToken middleware.',
      });
    }

    const { numeroCuenta, tipoCuenta, monto, descripcion } = req.body;

    // asegurar número
    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum < 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido',
        error: 'El monto debe ser numérico y mayor que 0',
      });
    }

    const account = await Account.findOne({
      numeroCuenta,
      tipoCuenta,
      estado: true,
    });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada o inactiva',
      });
    }

    const saldoAnterior = Number(account.saldo || 0);
    account.saldo = saldoAnterior + montoNum;
    await account.save();

    // Ventana de reversión: 1 minuto
    const reversibleHasta = new Date(Date.now() + 60 * 1000);

    const deposit = new Deposit({
      cuenta: account._id,
      montoOriginal: montoNum,
      montoActual: montoNum,
      descripcion: descripcion || 'Deposito administrativo',
      admin: adminId,
      reversibleHasta,
    });
    await deposit.save();

    // Registrar transacción en historial
    const transaction = new Transaction({
      tipo: 'deposito',
      monto: montoNum,
      descripcion: deposit.descripcion,
      cuentaOrigen: null,
      cuentaDestino: account._id,
      saldoAnteriorDestino: saldoAnterior,
      saldoPosteriorDestino: account.saldo,
      ejecutadaPor: adminId,
    });
    await transaction.save();

    deposit.transaccion = transaction._id;
    await deposit.save();

    return res.status(201).json({
      success: true,
      message: 'Deposito realizado exitosamente',
      data: deposit,
      reversibleHasta,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al realizar el deposito',
      error: error.message,
    });
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
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'No se pudo identificar al administrador desde el token',
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
        message: 'Este deposito ya fue revertido',
      });
    }

    if (new Date() > deposit.reversibleHasta) {
      return res.status(400).json({
        success: false,
        message:
          'El tiempo para revertir este deposito ha expirado (maximo 1 minuto)',
      });
    }

    const account = deposit.cuenta;
    const saldoAnterior = Number(account.saldo || 0);

    if (saldoAnterior < deposit.montoActual) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente para revertir el deposito',
      });
    }

    account.saldo = saldoAnterior - deposit.montoActual;
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
      ejecutadaPor: adminId,
    });

    return res.status(200).json({
      success: true,
      message: 'Deposito revertido exitosamente',
      data: deposit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al revertir el deposito',
      error: error.message,
    });
  }
};