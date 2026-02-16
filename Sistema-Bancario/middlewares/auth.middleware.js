'use strict';
import { verifyAccessToken } from '../configs/jwt.js';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado. Acceso denegado'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token invalido o expirado'
        });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user?.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de administrador'
        });
    }
    next();
};

export const isCliente = (req, res, next) => {
    if (req.user?.rol !== 'cliente') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de cliente'
        });
    }
    next();
};
