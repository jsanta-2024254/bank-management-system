'use strict';
import { User } from '../users/user-model.js';
import { UserRole, Role } from '../auth/role.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../configs/jwt.js';
import { verifyPassword } from '../../utils/password-utils.js';

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { Username: username, Status: true } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        const isMatch = await verifyPassword(user.Password, password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        // Obtener el rol del usuario
        const userRole = await UserRole.findOne({
            where: { UserId: user.Id },
            include: [{ model: Role, as: 'Role' }]
        });
        const role = userRole?.Role?.Name ?? 'USER_ROLE';

        const payload = { id: user.Id, username: user.Username, role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.Id,
                    name: user.Name,
                    username: user.Username,
                    email: user.Email
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

        const user = await User.findOne({ where: { Id: decoded.id, Status: true } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        // Obtener el rol del usuario
        const userRole = await UserRole.findOne({
            where: { UserId: user.Id },
            include: [{ model: Role, as: 'Role' }]
        });
        const role = userRole?.Role?.Name ?? 'USER_ROLE';

        const payload = { id: user.Id, username: user.Username, role };
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