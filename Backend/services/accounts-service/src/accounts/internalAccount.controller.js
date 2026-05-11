'use strict';

import Account from './account.model.js';
import { generateAccountNumber } from '../../configs/accountNumber.js';

const TIPOS_CUENTA_PERMITIDOS = ['monetaria', 'ahorro'];

const obtenerSaldoInicial = (saldo) => {
  const saldoNumerico = Number(saldo);
  return Number.isFinite(saldoNumerico) && saldoNumerico > 0 ? saldoNumerico : 0;
};

const crearFiltroCuentasPorUsuario = ({ userId, estado }) => {
  const filter = { usuario: userId };

  if (estado !== undefined) {
    filter.estado = estado === 'true';
  } else {
    filter.estado = true;
  }

  return filter;
};

export const createInternalAccount = async (req, res) => {
  try {
    const { userId, tipoCuenta = 'monetaria', saldo = 0 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'El userId es requerido',
      });
    }

    if (!TIPOS_CUENTA_PERMITIDOS.includes(tipoCuenta)) {
      return res.status(400).json({
        success: false,
        message: 'tipoCuenta inválido. Valores permitidos: monetaria, ahorro',
      });
    }

    const existingAccount = await Account.findOne({
      usuario: userId,
      tipoCuenta,
      estado: true,
    });

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: `El usuario ya tiene una cuenta ${tipoCuenta} activa`,
        data: existingAccount,
      });
    }

    const numeroCuenta = await generateAccountNumber();

    const account = await Account.create({
      numeroCuenta,
      tipoCuenta,
      saldo: obtenerSaldoInicial(saldo),
      usuario: userId,
      estado: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Cuenta interna creada exitosamente',
      data: account,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya tiene una cuenta activa del tipo indicado',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al crear cuenta interna',
      error: error.message,
    });
  }
};

export const getInternalAccountByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const filter = crearFiltroCuentasPorUsuario({
      userId,
      estado: req.query.estado,
    });

    const accounts = await Account.find(filter).sort({ tipoCuenta: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas internas por usuario',
      error: error.message,
    });
  }
};

export const deactivateInternalAccountsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Account.updateMany(
      { usuario: userId },
      { $set: { estado: false } }
    );

    return res.status(200).json({
      success: true,
      message: 'Cuentas internas desactivadas exitosamente',
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al desactivar cuentas internas del usuario',
      error: error.message,
    });
  }
};