'use strict';
import mongoose from 'mongoose';
import Favorite from './favorite.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';
import DailyLimit from '../deposits/dailyLimit.model.js';

// GET /api/favorites
export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ usuario: req.user.id })
            .populate({
                path: 'cuenta',
                select: 'numeroCuenta tipoCuenta saldo estado',
                match: { estado: true } 
            })
            .sort({ createdAt: -1 });

        const activeFavorites = favorites.filter(f => f.cuenta !== null);

        res.status(200).json({
            success: true,
            data: activeFavorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los favoritos',
            error: error.message
        });
    }
};

// POST /api/favorites
export const addFavorite = async (req, res) => {
    try {
        const { numeroCuenta, tipoCuenta, alias } = req.body;

        const account = await Account.findOne({ numeroCuenta, tipoCuenta, estado: true });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada o inactiva'
            });
        }

        // No agregar su propia cuenta
        if (account.usuario.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'No puedes agregar tu propia cuenta como favorita'
            });
        }

        const favorite = new Favorite({
            usuario: req.user.id,
            cuenta: account._id,
            alias,
            numeroCuenta,
            tipoCuenta
        });
        await favorite.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta agregada a favoritos exitosamente',
            data: favorite
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Esta cuenta ya esta en tus favoritos'
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al agregar favorito',
            error: error.message
        });
    }
};

// PUT /api/favorites/:id
export const updateFavorite = async (req, res) => {
    try {
        const { alias } = req.body;
        const favorite = await Favorite.findOneAndUpdate(
            { _id: req.params.id, usuario: req.user.id },
            { $set: { alias } },
            { new: true, runValidators: true }
        );

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Alias actualizado exitosamente',
            data: favorite
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el favorito',
            error: error.message
        });
    }
};

// DELETE /api/favorites/:id
export const deleteFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findOneAndDelete({
            _id: req.params.id,
            usuario: req.user.id
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Favorito eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el favorito',
            error: error.message
        });
    }
};

// POST /api/favorites/:id/transfer
export const transferToFavorite = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { monto, descripcion } = req.body;
        const montoNum = parseFloat(monto);

        // 1. Buscar favorito y cuenta origen dentro de la sesión
        const favorite = await Favorite.findOne({ _id: req.params.id, usuario: req.user.id })
            .populate('cuenta')
            .session(session);

        if (!favorite) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'Favorito no encontrado' });
        }

        const cuentaDestino = favorite.cuenta;
        if (!cuentaDestino || !cuentaDestino.estado) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'La cuenta favorita esta inactiva y no puede recibir transferencias'
            });
        }

        const cuentaOrigen = await Account.findOne(
            { usuario: req.user.id, estado: true }
        ).session(session);

        if (!cuentaOrigen || cuentaOrigen.saldo < montoNum) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente o cuenta inactiva'
            });
        }

        // 2. Verificar límite diario
        const hoy = new Date().toISOString().split('T')[0];
        let dailyLimit = await DailyLimit.findOne(
            { usuario: req.user.id, fecha: hoy }
        ).session(session);
        const totalHoy = dailyLimit ? dailyLimit.totalTransferido : 0;

        if (totalHoy + montoNum > 10000) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Limite diario excedido. Disponible: Q${(10000 - totalHoy).toFixed(2)}`
            });
        }

        // 3. Realizar movimientos
        const saldoAnteriorOrigen  = cuentaOrigen.saldo;
        const saldoAnteriorDestino = cuentaDestino.saldo;

        cuentaOrigen.saldo  -= montoNum;
        cuentaDestino.saldo += montoNum;

        await cuentaOrigen.save({ session });
        await cuentaDestino.save({ session });

        // 4. Registrar transacción
        const transaction = new Transaction({
            tipo: 'transferencia',
            monto: montoNum,
            descripcion: descripcion || `Transferencia a favorito: ${favorite.alias}`,
            cuentaOrigen: cuentaOrigen._id,
            cuentaDestino: cuentaDestino._id,
            saldoAnteriorOrigen,
            saldoPosteriorOrigen: cuentaOrigen.saldo,
            saldoAnteriorDestino,
            saldoPosteriorDestino: cuentaDestino.saldo,
            ejecutadaPor: req.user.id
        });
        await transaction.save({ session });

        // 5. Actualizar límite
        if (dailyLimit) {
            dailyLimit.totalTransferido += montoNum;
            await dailyLimit.save({ session });
        } else {
            await DailyLimit.create(
                [{ usuario: req.user.id, fecha: hoy, totalTransferido: montoNum }],
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Transferencia exitosa',
            data: transaction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Error en transferencia',
            error: error.message
        });
    }
};