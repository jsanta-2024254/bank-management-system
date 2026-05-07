'use strict';

import Transaction from './transaction.model.js';

export const createInternalTransaction = async (req, res) => {
  try {
    const {
      tipo,
      monto,
      descripcion,
      cuentaOrigen = null,
      cuentaDestino = null,
      saldoAnteriorOrigen = null,
      saldoPosteriorOrigen = null,
      saldoAnteriorDestino = null,
      saldoPosteriorDestino = null,
      estado = 'completada',
      ejecutadaPor,
    } = req.body;

    if (!tipo || !monto || !ejecutadaPor) {
      return res.status(400).json({
        success: false,
        message: 'tipo, monto y ejecutadaPor son requeridos',
      });
    }

    const transaction = await Transaction.create({
      tipo,
      monto: Number(monto),
      descripcion,
      cuentaOrigen,
      cuentaDestino,
      saldoAnteriorOrigen,
      saldoPosteriorOrigen,
      saldoAnteriorDestino,
      saldoPosteriorDestino,
      estado,
      ejecutadaPor,
    });

    return res.status(201).json({
      success: true,
      message: 'Transacción interna creada exitosamente',
      data: transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear transacción interna',
      error: error.message,
    });
  }
};

export const getInternalTransactionsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const limit = Number(req.query.limit || 5);

    const transactions = await Transaction.find({
      $or: [{ cuentaOrigen: accountId }, { cuentaDestino: accountId }],
    })
      .populate('cuentaOrigen', 'numeroCuenta tipoCuenta')
      .populate('cuentaDestino', 'numeroCuenta tipoCuenta')
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones internas por cuenta',
      error: error.message,
    });
  }
};

export const getInternalTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('cuentaOrigen', 'numeroCuenta tipoCuenta')
      .populate('cuentaDestino', 'numeroCuenta tipoCuenta');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener transacción interna',
      error: error.message,
    });
  }
};