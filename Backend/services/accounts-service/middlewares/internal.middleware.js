'use strict';

export const verifyInternalApiKey = (req, res, next) => {
  const receivedKey = req.headers['x-internal-api-key'];
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey) {
    return res.status(500).json({
      success: false,
      message: 'INTERNAL_API_KEY no está configurada en el servicio',
    });
  }

  if (!receivedKey || receivedKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado para consumir endpoint interno',
    });
  }

  next();
};