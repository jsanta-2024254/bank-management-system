'use strict';

import {
  User,
  UserProfile,
  UserEmail,
  UserPasswordReset,
} from './user-model.js';
import { ClientProfile } from './clientProfile.model.js';
import { UserRole, Role } from '../auth/role.model.js';
import { hashPassword } from '../../utils/password-utils.js';
import { USER_ROLE } from '../../helpers/role-constants.js';
import { sequelize } from '../../configs/db.js';

import {
  createAccountForUser,
  deactivateAccountsByUser,
  getAccountsByUser,
} from '../../clients/accounts.client.js';
import { getTransactionsByAccount } from '../../clients/transactions.client.js';

const TIPOS_CUENTA_PERMITIDOS = ['monetaria', 'ahorro'];

const formatUser = (user) => ({
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
  creadoEn: user.CreatedAt,
});

const formatearCuenta = (account) => ({
  id: account._id || account.id,
  _id: account._id || account.id,
  numeroCuenta: account.numeroCuenta,
  tipoCuenta: account.tipoCuenta,
  saldo: account.saldo,
  usuario: account.usuario,
  usuarioId: account.usuario,
  estado: account.estado,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

const ordenarMovimientosRecientes = (movimientos) => {
  return movimientos
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const obtenerUltimosMovimientosPorCuentas = async (accounts, limit = 5) => {
  if (!accounts.length) {
    return [];
  }

  const movimientosPorCuenta = await Promise.all(
    accounts.map(async (account) => {
      const accountId = account._id || account.id;
      return getTransactionsByAccount(accountId, limit);
    })
  );

  return ordenarMovimientosRecientes(movimientosPorCuenta.flat()).slice(0, limit);
};

const getAccountsWithTransactions = async (userId) => {
  try {
    const accounts = await getAccountsByUser(userId, { estado: true });
    const cuentas = accounts.map(formatearCuenta);
    const lastTransactions = await obtenerUltimosMovimientosPorCuentas(
      accounts,
      5
    );

    return {
      cuenta: cuentas[0] || null,
      cuentas,
      ultimosMovimientos: lastTransactions,
    };
  } catch (error) {
    console.warn(
      `UsersService | No se pudo obtener informacion financiera del usuario ${userId}: ${error.message}`
    );

    return {
      cuenta: null,
      cuentas: [],
      ultimosMovimientos: [],
      advertenciaFinanciera:
        'No se pudo consultar la información financiera del usuario',
    };
  }
};

const obtenerMontoInicial = (saldoInicial) => {
  if (saldoInicial === undefined || saldoInicial === null || saldoInicial === '') {
    return 0;
  }

  return Number(saldoInicial);
};

const desactivarCuentasAntesQueUsuario = async (user) => {
  try {
    await deactivateAccountsByUser(user.Id);
  } catch (internalError) {
    const error = new Error(
      'No se pudo desactivar el usuario porque primero deben desactivarse sus cuentas bancarias.'
    );

    error.statusCode = 502;
    error.originalError = internalError;
    throw error;
  }
};

// POST /api/v1/admin/users
export const createUser = async (req, res) => {
  const sequelizeTx = await User.sequelize.transaction();
  let transactionFinished = false;
  let user = null;

  try {
    const {
      nombre,
      apellido,
      username,
      email,
      password,
      celular,
      dpi,
      direccion,
      nombreTrabajo,
      ingresosMensuales,
      tipoCuenta = 'monetaria',
      saldoInicial = 0,
    } = req.body;

    const montoInicial = obtenerMontoInicial(saldoInicial);

    if (!TIPOS_CUENTA_PERMITIDOS.includes(tipoCuenta)) {
      await sequelizeTx.rollback();
      transactionFinished = true;

      return res.status(400).json({
        success: false,
        message: 'tipoCuenta inválido. Valores permitidos: monetaria, ahorro',
      });
    }

    if (Number.isNaN(montoInicial) || montoInicial < 0) {
      await sequelizeTx.rollback();
      transactionFinished = true;

      return res.status(400).json({
        success: false,
        message: 'El saldo inicial debe ser un número mayor o igual a 0',
      });
    }

    if (Number(ingresosMensuales) < 100) {
      await sequelizeTx.rollback();
      transactionFinished = true;

      return res.status(400).json({
        success: false,
        message:
          'Los ingresos mensuales deben ser al menos Q100 para crear una cuenta',
      });
    }

    const hashedPassword = await hashPassword(password);

    user = await User.create(
      {
        Name: nombre,
        Surname: apellido || '',
        Username: username.toLowerCase(),
        Email: email.toLowerCase(),
        Password: hashedPassword,
        Status: true,
      },
      { transaction: sequelizeTx }
    );

    await UserProfile.create(
      {
        UserId: user.Id,
        Phone: celular,
      },
      { transaction: sequelizeTx }
    );

    await ClientProfile.create(
      {
        UserId: user.Id,
        Dpi: dpi,
        Direccion: direccion,
        NombreTrabajo: nombreTrabajo,
        IngresosMensuales: Number(ingresosMensuales),
      },
      { transaction: sequelizeTx }
    );

    await UserEmail.create(
      {
        UserId: user.Id,
        EmailVerified: true,
      },
      { transaction: sequelizeTx }
    );

    await UserPasswordReset.create(
      {
        UserId: user.Id,
      },
      { transaction: sequelizeTx }
    );

    const userRole = await Role.findOne({
      where: { Name: USER_ROLE },
      transaction: sequelizeTx,
    });

    if (userRole) {
      await UserRole.create(
        {
          UserId: user.Id,
          RoleId: userRole.Id,
        },
        { transaction: sequelizeTx }
      );
    }

    await sequelizeTx.commit();
    transactionFinished = true;

    let account = null;

    try {
      account = await createAccountForUser({
        userId: user.Id,
        tipoCuenta,
        saldo: montoInicial,
      });
    } catch (internalError) {
      await User.update({ Status: false }, { where: { Id: user.Id } }).catch(
        () => null
      );

      return res.status(502).json({
        success: false,
        message:
          'El usuario fue creado en PostgreSQL, pero no se pudo crear la cuenta bancaria. El usuario fue desactivado como compensación.',
        error: internalError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: {
        user: {
          id: user.Id,
          nombre: user.Name,
          apellido: user.Surname,
          username: user.Username,
          email: user.Email,
          celular,
          dpi,
          direccion,
          nombreTrabajo,
          ingresosMensuales: Number(ingresosMensuales),
          saldoInicial: montoInicial,
          estado: user.Status,
        },
        cuenta: account,
      },
    });
  } catch (error) {
    if (!transactionFinished) {
      await sequelizeTx.rollback();
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors?.[0]?.path || 'campo';

      return res.status(400).json({
        success: false,
        message: `El ${field} ya está registrado`,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Error al crear el cliente',
      error: error.message,
    });
  }
};

// GET /api/v1/admin/users
export const getUsers = async (req, res) => {
  try {
    const pageNum = Number(req.query.page ?? 1);
    const limitNum = Number(req.query.limit ?? 10);

    const estadoParam = req.query.estado;
    const estadoFiltro =
      estadoParam === undefined ? true : estadoParam === 'true';

    const offset = (pageNum - 1) * limitNum;

    const { count: total, rows: users } = await User.findAndCountAll({
      where: { Status: estadoFiltro },
      include: [
        { model: UserProfile, as: 'UserProfile', required: false },
        { model: ClientProfile, as: 'ClientProfile', required: false },
        {
          model: UserRole,
          as: 'UserRoles',
          required: false,
          include: [
            {
              model: Role,
              as: 'Role',
              required: false,
              where: { Name: USER_ROLE },
            },
          ],
        },
      ],
      attributes: { exclude: ['Password'] },
      distinct: true,
      subQuery: false,
      limit: limitNum,
      offset,
      order: [[sequelize.col('User.created_at'), 'DESC']],
    });

    const usersWithData = await Promise.all(
      users.map(async (user) => {
        const financialData = await getAccountsWithTransactions(user.Id);

        return {
          ...formatUser(user),
          ...financialData,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: usersWithData,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: 'Error al obtener los usuarios',
      error: error.message,
    });
  }
};

// GET /api/v1/admin/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
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

    const financialData = await getAccountsWithTransactions(user.Id);

    return res.status(200).json({
      success: true,
      data: {
        ...formatUser(user),
        ...financialData,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: error.message,
    });
  }
};

// PUT /api/v1/admin/users/:id
export const updateUser = async (req, res) => {
  const sequelizeTx = await User.sequelize.transaction();

  try {
    const user = await User.findByPk(req.params.id, {
      transaction: sequelizeTx,
    });

    if (!user) {
      await sequelizeTx.rollback();

      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const userFieldMap = {
      nombre: 'Name',
      apellido: 'Surname',
      username: 'Username',
      email: 'Email',
    };

    const userUpdates = {};

    for (const [bodyKey, modelKey] of Object.entries(userFieldMap)) {
      if (
        req.body[bodyKey] !== undefined &&
        req.body[bodyKey] !== null &&
        req.body[bodyKey] !== ''
      ) {
        userUpdates[modelKey] =
          bodyKey === 'username' || bodyKey === 'email'
            ? req.body[bodyKey].toLowerCase()
            : req.body[bodyKey];
      }
    }

    if (Object.keys(userUpdates).length > 0) {
      await user.update(userUpdates, { transaction: sequelizeTx });
    }

    if (req.body.celular) {
      await UserProfile.update(
        { Phone: req.body.celular },
        { where: { UserId: user.Id }, transaction: sequelizeTx }
      );
    }

    const clientUpdates = {};

    if (req.body.direccion !== undefined) {
      clientUpdates.Direccion = req.body.direccion;
    }

    if (req.body.nombreTrabajo !== undefined) {
      clientUpdates.NombreTrabajo = req.body.nombreTrabajo;
    }

    if (req.body.ingresosMensuales !== undefined) {
      if (Number(req.body.ingresosMensuales) < 100) {
        await sequelizeTx.rollback();

        return res.status(400).json({
          success: false,
          message: 'Los ingresos mensuales deben ser al menos Q100',
        });
      }

      clientUpdates.IngresosMensuales = Number(req.body.ingresosMensuales);
    }

    if (Object.keys(clientUpdates).length > 0) {
      await ClientProfile.update(clientUpdates, {
        where: { UserId: user.Id },
        transaction: sequelizeTx,
      });
    }

    await sequelizeTx.commit();

    const updatedUser = await User.findByPk(user.Id, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: ClientProfile, as: 'ClientProfile' },
      ],
      attributes: { exclude: ['Password'] },
    });

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: formatUser(updatedUser),
    });
  } catch (error) {
    await sequelizeTx.rollback();

    return res.status(400).json({
      success: false,
      message: 'Error al actualizar el usuario',
      error: error.message,
    });
  }
};

// DELETE /api/v1/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    if (user.Status === false) {
      return res.status(200).json({
        success: true,
        message: 'Usuario ya se encontraba desactivado',
      });
    }

    await desactivarCuentasAntesQueUsuario(user);

    await user.update({ Status: false });

    return res.status(200).json({
      success: true,
      message: 'Usuario y cuentas bancarias desactivados exitosamente',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 502
          ? error.message
          : 'Error al eliminar el usuario',
      error: error.originalError?.message || error.message,
    });
  }
};