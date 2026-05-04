'use strict';
import { User, UserProfile } from './user-model.js';
import { ClientProfile } from './clientProfile.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';

// GET /api/v1/me  – Ver perfil propio del cliente
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.sub, {
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
                cuenta: account ? {
                    id: account._id,
                    numeroCuenta: account.numeroCuenta,
                    tipoCuenta: account.tipoCuenta,
                    saldo: account.saldo
                } : null,
                ultimosMovimientos: lastTransactions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el perfil',
            error: error.message
        });
    }
};

// PUT /api/v1/me  – El cliente edita su propio perfil
// Campos editables: nombre, direccion, nombreTrabajo, ingresosMensuales
export const updateMyProfile = async (req, res) => {
    const sequelizeTx = await User.sequelize.transaction();
    try {
        const userId = req.user.sub;

        const user = await User.findByPk(userId, { transaction: sequelizeTx });
        if (!user) {
            await sequelizeTx.rollback();
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // El cliente solo puede editar nombre (no apellido/username/email)
        const userUpdates = {};
        if (req.body.nombre !== undefined && req.body.nombre.trim() !== '') {
            userUpdates.Name = req.body.nombre.trim();
        }

        if (Object.keys(userUpdates).length > 0) {
            await user.update(userUpdates, { transaction: sequelizeTx });
        }

        // Actualizar campos bancarios en ClientProfile
        const clientUpdates = {};
        if (req.body.direccion !== undefined && req.body.direccion.trim() !== '') {
            clientUpdates.Direccion = req.body.direccion.trim();
        }
        if (req.body.nombreTrabajo !== undefined && req.body.nombreTrabajo.trim() !== '') {
            clientUpdates.NombreTrabajo = req.body.nombreTrabajo.trim();
        }
        if (req.body.ingresosMensuales !== undefined) {
            const ingresos = Number(req.body.ingresosMensuales);
            if (isNaN(ingresos) || ingresos < 100) {
                await sequelizeTx.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Los ingresos mensuales deben ser al menos Q100'
                });
            }
            clientUpdates.IngresosMensuales = ingresos;
        }

        if (Object.keys(clientUpdates).length > 0) {
            await ClientProfile.update(clientUpdates, { where: { UserId: userId }, transaction: sequelizeTx });
        }

        if (Object.keys(userUpdates).length === 0 && Object.keys(clientUpdates).length === 0) {
            await sequelizeTx.rollback();
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos válidos para actualizar. Campos permitidos: nombre, direccion, nombreTrabajo, ingresosMensuales'
            });
        }

        await sequelizeTx.commit();

        // Recargar datos para respuesta
        const updated = await User.findByPk(userId, {
            include: [
                { model: UserProfile, as: 'UserProfile' },
                { model: ClientProfile, as: 'ClientProfile' }
            ],
            attributes: { exclude: ['Password'] }
        });

        res.status(200).json({
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
            }
        });
    } catch (error) {
        await sequelizeTx.rollback();
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el perfil',
            error: error.message
        });
    }
};