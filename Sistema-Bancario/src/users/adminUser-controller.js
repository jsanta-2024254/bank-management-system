'use strict';
import { User, UserProfile, UserEmail, UserPasswordReset } from './user-model.js';
import { UserRole, Role } from '../auth/role.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';
import { generateAccountNumber } from '../../configs/accountNumber.js';
import { hashPassword } from '../../utils/password-utils.js';
import { USER_ROLE } from '../../helpers/role-constants.js';
import { Op } from 'sequelize';

// POST /api/admin/users
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

        if (ingresosMensuales < 100) {
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

        // Crear perfil con teléfono y datos extra en metadata
        await UserProfile.create({
            UserId: user.Id,
            Phone: celular,
        }, { transaction: sequelizeTx });

        await UserEmail.create({
            UserId: user.Id,
            EmailVerified: true,
        }, { transaction: sequelizeTx });

        // Crear registro de password reset vacío
        await UserPasswordReset.create({
            UserId: user.Id,
        }, { transaction: sequelizeTx });

        // Asignar rol de usuario normal
        const userRole = await Role.findOne({ where: { Name: USER_ROLE } }, { transaction: sequelizeTx });
        if (userRole) {
            await UserRole.create({
                UserId: user.Id,
                RoleId: userRole.Id,
            }, { transaction: sequelizeTx });
        }

        await sequelizeTx.commit();

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

const formatUser = (user) => ({
    id: user.Id,
    nombre: user.Name,
    apellido: user.Surname,
    username: user.Username,
    email: user.Email,
    celular: user.UserProfile?.Phone,
    estado: user.Status,
    creadoEn: user.CreatedAt
});

// GET /api/admin/users
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
                {
                    model: UserRole,
                    as: 'UserRoles',
                    required: false,
                    include: [{ model: Role, as: 'Role', required: false }]
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
                    }).sort({ createdAt: -1 }).limit(5);
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

// GET /api/admin/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: UserProfile, as: 'UserProfile' }],
            attributes: { exclude: ['Password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const account = await Account.findOne({ usuario: user.Id, estado: true });
        let lastTransactions = [];
        if (account) {
            lastTransactions = await Transaction.find({
                $or: [{ cuentaOrigen: account._id }, { cuentaDestino: account._id }]
            }).sort({ createdAt: -1 }).limit(5);
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

// PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
    try {
        const fieldMap = {
            nombre: 'Name',
            apellido: 'Surname',
            username: 'Username',
            email: 'Email'
        };

        const allowedFields = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (value !== undefined && value !== null && value !== '') {
                if (fieldMap[key]) {
                    allowedFields[fieldMap[key]] = value;
                }
            }
        }

        if (Object.keys(allowedFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos válidos para actualizar. Campos permitidos: nombre, apellido, username, email'
            });
        }

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        await user.update(allowedFields);

        if (req.body.celular) {
            await UserProfile.update(
                { Phone: req.body.celular },
                { where: { UserId: user.Id } }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: formatUser(user)
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};

// DELETE /api/admin/users/:id  (desactivación lógica)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
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