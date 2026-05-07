'use strict';

import { User, UserProfile } from './user-model.js';
import { ClientProfile } from './clientProfile.model.js';
import { getAccountByUser } from '../../clients/accounts.client.js';
import { getTransactionsByAccount } from '../../clients/transactions.client.js';

const getAuthenticatedUserId = (req) => {
  return req.user?.id || req.user?.sub || req.userId;
};

// GET /api/v1/me
export const getMyProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    const user = await User.findByPk(userId, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: ClientProfile, as: 'ClientProfile' },
      ],
      attributes: { exclude: ['Password'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const account = await getAccountByUser(user.Id, { estado: true });

    let lastTransactions = [];

    if (account) {
      const accountId = account._id || account.id;
      lastTransactions = await getTransactionsByAccount(accountId, 5);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.Id,
        nombre: user.Name,
        apellido: user.Surname,
        username: user.Username,
        email: user.Email,
        celular: user.UserProfile?.Phone,
        dpi: user.ClientProfile?.Dpi,
        direccion: user.ClientProfile?.Direccion,
        nombreTrabajo: user.ClientProfile?.NombreTrabajo,
        ingresosMensuales: user.ClientProfile?.IngresosMensuales,
        estado: user.Status,
        cuenta: account
          ? {
              id: account._id || account.id,
              numeroCuenta: account.numeroCuenta,
              tipoCuenta: account.tipoCuenta,
              saldo: account.saldo,
            }
          : null,
        ultimosMovimientos: lastTransactions,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: 'Error al obtener el perfil',
      error: error.message,
    });
  }
};

// PUT /api/v1/me
export const updateMyProfile = async (req, res) => {
  const sequelizeTx = await User.sequelize.transaction();

  try {
    const userId = getAuthenticatedUserId(req);

    const user = await User.findByPk(userId, { transaction: sequelizeTx });

    if (!user) {
      await sequelizeTx.rollback();

      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const userUpdates = {};

    if (req.body.nombre !== undefined && req.body.nombre.trim() !== '') {
      userUpdates.Name = req.body.nombre.trim();
    }

    if (Object.keys(userUpdates).length > 0) {
      await user.update(userUpdates, { transaction: sequelizeTx });
    }

    const clientUpdates = {};

    if (req.body.direccion !== undefined && req.body.direccion.trim() !== '') {
      clientUpdates.Direccion = req.body.direccion.trim();
    }

    if (
      req.body.nombreTrabajo !== undefined &&
      req.body.nombreTrabajo.trim() !== ''
    ) {
      clientUpdates.NombreTrabajo = req.body.nombreTrabajo.trim();
    }

    if (req.body.ingresosMensuales !== undefined) {
      const ingresos = Number(req.body.ingresosMensuales);

      if (Number.isNaN(ingresos) || ingresos < 100) {
        await sequelizeTx.rollback();

        return res.status(400).json({
          success: false,
          message: 'Los ingresos mensuales deben ser al menos Q100',
        });
      }

      clientUpdates.IngresosMensuales = ingresos;
    }

    if (Object.keys(clientUpdates).length > 0) {
      await ClientProfile.update(clientUpdates, {
        where: { UserId: userId },
        transaction: sequelizeTx,
      });
    }

    if (
      Object.keys(userUpdates).length === 0 &&
      Object.keys(clientUpdates).length === 0
    ) {
      await sequelizeTx.rollback();

      return res.status(400).json({
        success: false,
        message:
          'No se proporcionaron campos válidos para actualizar. Campos permitidos: nombre, direccion, nombreTrabajo, ingresosMensuales',
      });
    }

    await sequelizeTx.commit();

    const updated = await User.findByPk(userId, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: ClientProfile, as: 'ClientProfile' },
      ],
      attributes: { exclude: ['Password'] },
    });

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: updated.Id,
        nombre: updated.Name,
        apellido: updated.Surname,
        username: updated.Username,
        email: updated.Email,
        celular: updated.UserProfile?.Phone,
        dpi: updated.ClientProfile?.Dpi,
        direccion: updated.ClientProfile?.Direccion,
        nombreTrabajo: updated.ClientProfile?.NombreTrabajo,
        ingresosMensuales: updated.ClientProfile?.IngresosMensuales,
      },
    });
  } catch (error) {
    await sequelizeTx.rollback();

    return res.status(400).json({
      success: false,
      message: 'Error al actualizar el perfil',
      error: error.message,
    });
  }
};