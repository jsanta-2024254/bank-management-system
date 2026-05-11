'use strict';

import { User, UserProfile } from './user-model.js';
import { ClientProfile } from './clientProfile.model.js';
import { getAccountByUser } from '../../clients/accounts.client.js';
import { getTransactionsByAccount } from '../../clients/transactions.client.js';

const getAuthenticatedUserId = (req) => {
  return req.user?.id || req.user?.sub || req.userId;
};

const obtenerTextoLimpio = (valor) => {
  if (valor === undefined || valor === null) {
    return null;
  }

  const texto = String(valor).trim();
  return texto === '' ? null : texto;
};

const formatearPerfil = (user, role, account = null, lastTransactions = []) => {
  return {
    id: user.Id,
    nombre: user.Name,
    apellido: user.Surname,
    username: user.Username,
    email: user.Email,
    celular: user.UserProfile?.Phone || '',
    profilePicture: user.UserProfile?.ProfilePicture || '',
    dpi: user.ClientProfile?.Dpi || '',
    direccion: user.ClientProfile?.Direccion || '',
    nombreTrabajo: user.ClientProfile?.NombreTrabajo || '',
    ingresosMensuales: user.ClientProfile?.IngresosMensuales || '',
    estado: user.Status,
    role,
    roles: [role],
    cuenta: account
      ? {
          id: account._id || account.id,
          numeroCuenta: account.numeroCuenta,
          tipoCuenta: account.tipoCuenta,
          saldo: account.saldo,
        }
      : null,
    ultimosMovimientos: lastTransactions,
  };
};

// GET /api/v1/me
export const getMyProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const role = req.user?.role || 'USER_ROLE';

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

    let account = null;
    let lastTransactions = [];

    if (role === 'USER_ROLE') {
      account = await getAccountByUser(user.Id, { estado: true });

      if (account) {
        const accountId = account._id || account.id;
        lastTransactions = await getTransactionsByAccount(accountId, 5);
      }
    }

    return res.status(200).json({
      success: true,
      data: formatearPerfil(user, role, account, lastTransactions),
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
    const role = req.user?.role || 'USER_ROLE';

    const user = await User.findByPk(userId, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: ClientProfile, as: 'ClientProfile' },
      ],
      transaction: sequelizeTx,
    });

    if (!user) {
      await sequelizeTx.rollback();

      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const userUpdates = {};
    const nombre = obtenerTextoLimpio(req.body.nombre);
    const apellido = obtenerTextoLimpio(req.body.apellido);

    if (nombre) {
      userUpdates.Name = nombre;
    }

    if (apellido) {
      userUpdates.Surname = apellido;
    }

    if (Object.keys(userUpdates).length > 0) {
      await user.update(userUpdates, { transaction: sequelizeTx });
    }

    const celular = obtenerTextoLimpio(req.body.celular);

    if (celular) {
      const perfilUsuario = await UserProfile.findOne({
        where: { UserId: userId },
        transaction: sequelizeTx,
      });

      if (perfilUsuario) {
        await perfilUsuario.update({ Phone: celular }, { transaction: sequelizeTx });
      } else {
        await UserProfile.create(
          {
            UserId: userId,
            Phone: celular,
          },
          { transaction: sequelizeTx }
        );
      }
    }

    const clientUpdates = {};
    const direccion = obtenerTextoLimpio(req.body.direccion);
    const nombreTrabajo = obtenerTextoLimpio(req.body.nombreTrabajo);

    if (direccion) {
      clientUpdates.Direccion = direccion;
    }

    if (nombreTrabajo) {
      clientUpdates.NombreTrabajo = nombreTrabajo;
    }

    if (req.body.ingresosMensuales !== undefined && req.body.ingresosMensuales !== '') {
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

    const tienePerfilCliente = !!user.ClientProfile;

    if (Object.keys(clientUpdates).length > 0 && tienePerfilCliente) {
      await ClientProfile.update(clientUpdates, {
        where: { UserId: userId },
        transaction: sequelizeTx,
      });
    }

    const huboCambios =
      Object.keys(userUpdates).length > 0 ||
      !!celular ||
      (Object.keys(clientUpdates).length > 0 && tienePerfilCliente);

    if (!huboCambios) {
      await sequelizeTx.rollback();

      return res.status(400).json({
        success: false,
        message:
          'No se proporcionaron campos válidos para actualizar. Campos permitidos: nombre, apellido, celular, direccion, nombreTrabajo, ingresosMensuales',
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
      data: formatearPerfil(updated, role),
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