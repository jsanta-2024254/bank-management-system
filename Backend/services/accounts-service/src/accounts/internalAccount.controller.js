'use strict';

import Account from './account.model.js';
import { generateAccountNumber } from '../../configs/accountNumber.js';

export const createInternalAccount = async (req, res) => {
  try {
    const { userId, tipoCuenta = 'monetaria', saldo = 0 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'El userId es requerido',
      });
    }

    if (!['monetaria', 'ahorro'].includes(tipoCuenta)) {
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
      saldo: Math.max(Number(saldo) || 0, 0),
      usuario: userId,
      estado: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Cuenta interna creada exitosamente',
      data: account,
    });
  } catch (error) {
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
    const estadoParam = req.query.estado;

    const filter = { usuario: userId };

    if (estadoParam !== undefined) {
      filter.estado = estadoParam === 'true';
    } else {
      filter.estado = true;
    }

    const account = await Account.findOne(filter);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada para el usuario',
      });
    }

    return res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener cuenta interna por usuario',
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
