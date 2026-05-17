'use strict';

import { verifyJWT } from '../helpers/generate-jwt.js';

const obtenerIdUsuarioDesdeToken = (decoded) => {
  return (
    decoded?.sub ??
    decoded?.id ??
    decoded?.Id ??
    decoded?.userId ??
    decoded?.UserId ??
    decoded?.uid ??
    null
  );
};

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Acceso denegado',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = await verifyJWT(token);
    const idUsuario = obtenerIdUsuarioDesdeToken(decoded);

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        message: 'Token válido pero sin identificador de usuario',
      });
    }

    req.user = {
      ...decoded,
      id: idUsuario,
      userId: idUsuario,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN_ROLE') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador',
    });
  }

  return next();
};

export const isCliente = (req, res, next) => {
  if (req.user?.role !== 'USER_ROLE') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de cliente',
    });
  }

  return next();
};