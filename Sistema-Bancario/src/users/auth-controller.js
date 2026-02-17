'use strict';
import User from '../users/user-model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../configs/jwt.js';

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username, estado: true }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        const payload = { id: user._id, rol: user.rol, username: user.username };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    nombre: user.nombre,
                    username: user.username,
                    email: user.email,
                    rol: user.rol
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesion',
            error: error.message
        });
    }
};

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token requerido'
            });
        }

        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findOne({ _id: decoded.id, estado: true });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        const payload = { id: user._id, rol: user.rol, username: user.username };
        const newAccessToken = generateAccessToken(payload);

        res.status(200).json({
            success: true,
            message: 'Token renovado exitosamente',
            data: { accessToken: newAccessToken }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Refresh token invalido o expirado'
        });
    }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
    try {
        // En una implementacion con DB de tokens se revocaría aquí
        res.status(200).json({
            success: true,
            message: 'Sesion cerrada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cerrar sesion',
            error: error.message
        });
    }
};
