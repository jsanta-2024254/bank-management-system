'use strict';
import { User, UserProfile, UserEmail, UserPasswordReset } from './user-model.js';
import { ClientProfile } from './clientProfile.model.js';
import { UserRole, Role } from '../auth/role.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';
import { generateAccountNumber } from '../../configs/accountNumber.js';
import { hashPassword } from '../../utils/password-utils.js';
import { USER_ROLE } from '../../helpers/role-constants.js';
import { Op } from 'sequelize';

// POST /api/v1/admin/users  – Crear cliente
export const createUser = async (req, res) => {
    const sequelizeTx = await User.sequelize.transaction();
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
            tipoCuenta = 'monetaria'
        } = req.body;

        // Validación de ingresos mínimos (también está en el middleware, pero se repite aquí por seguridad)
        if (Number(ingresosMensuales) < 100) {
            await sequelizeTx.rollback();
            return res.status(400).json({
                success: false,
                message: 'Los ingresos mensuales deben ser al menos Q100 para crear una cuenta'
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            Name: nombre,
            Surname: apellido || '',
            Username: username.toLowerCase(),
            Email: email.toLowerCase(),
            Password: hashedPassword,
            Status: true
        }, { transaction: sequelizeTx });

        // Perfil base (teléfono)
        await UserProfile.create({
            UserId: user.Id,
            Phone: celular,
        }, { transaction: sequelizeTx });

        // Perfil bancario (DPI, dirección, trabajo, ingresos)
        await ClientProfile.create({
            UserId: user.Id,
            Dpi: dpi,
            Direccion: direccion,
            NombreTrabajo: nombreTrabajo,
            IngresosMensuales: Number(ingresosMensuales),
        }, { transaction: sequelizeTx });

        await UserEmail.create({
            UserId: user.Id,
            EmailVerified: true,
        }, { transaction: sequelizeTx });

        await UserPasswordReset.create({
            UserId: user.Id,
        }, { transaction: sequelizeTx });

        // Asignar rol USER_ROLE
        const userRole = await Role.findOne({ where: { Name: USER_ROLE } }, { transaction: sequelizeTx });
        if (userRole) {
            await UserRole.create({
                UserId: user.Id,
                RoleId: userRole.Id,
            }, { transaction: sequelizeTx });
        }

        await sequelizeTx.commit();

        // Crear cuenta bancaria en MongoDB
        const numeroCuenta = await generateAccountNumber();
        const account = new Account({
            numeroCuenta,
            tipoCuenta,
            saldo: 0,
            usuario: user.Id
        });
        await account.save();

        res.status(201).json({
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
                    ingresosMensuales,
                    estado: user.Status
                },
                cuenta: account
            }
        });
    } catch (error) {
        await sequelizeTx.rollback();

        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors?.[0]?.path || 'campo';
            return res.status(400).json({
                success: false,
                message: `El ${field} ya está registrado`
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al crear el cliente',
            error: error.message
        });
    }
};

// Helper para formatear usuario
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
    creadoEn: user.CreatedAt
});

// GET /api/v1/admin/users  – Listar clientes 
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const estadoParam = req.query.estado;
        const estadoFiltro = estadoParam === undefined ? true : estadoParam === 'true';

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count: total, rows: users } = await User.findAndCountAll({
            where: { Status: estadoFiltro },
            include: [
                { model: UserProfile, as: 'UserProfile', required: false },
                { model: ClientProfile, as: 'ClientProfile', required: false },
                {
                    model: UserRole,
                    as: 'UserRoles',
                    required: true,       
                    include: [{
                        model: Role,
                        as: 'Role',
                        required: true,
                        where: { Name: USER_ROLE }  
                    }]
                }
            ],
            attributes: { exclude: ['Password'] },
            distinct: true,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        const usersWithData = await Promise.all(
            users.map(async (user) => {
                const account = await Account.findOne({ usuario: user.Id, estado: true });
                let lastTransactions = [];
                if (account) {
                    lastTransactions = await Transaction.find({
                        $or: [{ cuentaOrigen: account._id }, { cuentaDestino: account._id }]
                    })
                        .populate('cuentaOrigen', 'numeroCuenta tipoCuenta')
                        .populate('cuentaDestino', 'numeroCuenta tipoCuenta')
                        .sort({ createdAt: -1 })
                        .limit(5);
                }
                return {
                    ...formatUser(user),
                    cuenta: account,
                    ultimosMovimientos: lastTransactions
                };
            })
        );

        res.status(200).json({
            success: true,
            data: usersWithData,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los usuarios',
            error: error.message
        });
    }
};

// GET /api/v1/admin/users/:id  – Ver un cliente
export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [
                { model: UserProfile, as: 'UserProfile' },
                { model: ClientProfile, as: 'ClientProfile' }
            ],
            attributes: { exclude: ['Password'] }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const account = await Account.findOne({ usuario: user.Id, estado: true });
        let lastTransactions = [];
        if (account) {
            lastTransactions = await Transaction.find({
                $or: [{ cuentaOrigen: account._id }, { cuentaDestino: account._id }]
            })
                .populate('cuentaOrigen', 'numeroCuenta tipoCuenta')
                .populate('cuentaDestino', 'numeroCuenta tipoCuenta')
                .sort({ createdAt: -1 })
                .limit(5);
        }

        res.status(200).json({
            success: true,
            data: {
                ...formatUser(user),
                cuenta: account,
                ultimosMovimientos: lastTransactions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el usuario',
            error: error.message
        });
    }
};

// PUT /api/v1/admin/users/:id  – Actualizar cliente
// el admin NO puede modificar DPI ni contraseña
export const updateUser = async (req, res) => {
    const sequelizeTx = await User.sequelize.transaction();
    try {
        const user = await User.findByPk(req.params.id, { transaction: sequelizeTx });

        if (!user) {
            await sequelizeTx.rollback();
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Campos de User que el admin puede modificar (no contraseña, no DPI)
        const userFieldMap = { nombre: 'Name', apellido: 'Surname', username: 'Username', email: 'Email' };
        const userUpdates = {};
        for (const [bodyKey, modelKey] of Object.entries(userFieldMap)) {
            if (req.body[bodyKey] !== undefined && req.body[bodyKey] !== null && req.body[bodyKey] !== '') {
                userUpdates[modelKey] = req.body[bodyKey];
            }
        }

        if (Object.keys(userUpdates).length > 0) {
            await user.update(userUpdates, { transaction: sequelizeTx });
        }

        // Actualizar teléfono en UserProfile
        if (req.body.celular) {
            await UserProfile.update(
                { Phone: req.body.celular },
                { where: { UserId: user.Id }, transaction: sequelizeTx }
            );
        }

        // Actualizar campos bancarios en ClientProfile 
        const clientUpdates = {};
        if (req.body.direccion      !== undefined) clientUpdates.Direccion        = req.body.direccion;
        if (req.body.nombreTrabajo  !== undefined) clientUpdates.NombreTrabajo    = req.body.nombreTrabajo;
        if (req.body.ingresosMensuales !== undefined) {
            if (Number(req.body.ingresosMensuales) < 100) {
                await sequelizeTx.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Los ingresos mensuales deben ser al menos Q100'
                });
            }
            clientUpdates.IngresosMensuales = Number(req.body.ingresosMensuales);
        }

        if (Object.keys(clientUpdates).length > 0) {
            await ClientProfile.update(clientUpdates, { where: { UserId: user.Id }, transaction: sequelizeTx });
        }

        await sequelizeTx.commit();

        // Recargar para respuesta actualizada
        const updatedUser = await User.findByPk(user.Id, {
            include: [
                { model: UserProfile, as: 'UserProfile' },
                { model: ClientProfile, as: 'ClientProfile' }
            ],
            attributes: { exclude: ['Password'] }
        });

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: formatUser(updatedUser)
        });
    } catch (error) {
        await sequelizeTx.rollback();
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};

// DELETE /api/v1/admin/users/:id  
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        await user.update({ Status: false });
        await Account.updateMany({ usuario: user.Id }, { $set: { estado: false } });

        res.status(200).json({
            success: true,
            message: 'Usuario desactivado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el usuario',
            error: error.message
        });
    }
};