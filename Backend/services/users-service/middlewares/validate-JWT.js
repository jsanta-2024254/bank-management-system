import { verifyJWT } from '../helpers/generate-jwt.js';
import { findUserById } from '../helpers/user-db.js';

/**
 * Middleware para validar JWT
 */
export const validateJWT = async (req, res, next) => {
  try {
    let token =
      req.header('x-token') ||
      req.header('authorization') ||
      req.body.token ||
      req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token en la petición',
      });
    }

    // Limpiar el token si viene con Bearer (case-insensitive)
    token = token.replace(/^Bearer\s+/i, '').trim();

    // Validate token format (should have 3 parts separated by dots)
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'jwt malformed',
      });
    }

    // Verificar el token
    const decoded = await verifyJWT(token);

    // Buscar el usuario por ID (decoded.sub es string)
    const user = await findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - Usuario no existe',
      });
    }

    // Verificar si el usuario está activo
    if (!user.Status) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    // Agregar el usuario al request
    req.user = user;
    req.userId = user.Id.toString();

    next();
  } catch (error) {
    console.error('Error validating JWT:', error);

    let message = 'Error al verificar el token';
    let statusCode = 401;

    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token inválido';
      // Additional logging for malformed tokens
      if (error.message.includes('malformed')) {
        console.error('Token malformed details:', {
          tokenStart: req.header('authorization')?.substring(0, 50),
          tokenLength: req.header('authorization')?.length,
        });
      }
    } else if (error.name === 'NotBeforeError') {
      message = 'Token no es válido aún';
    }

    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
