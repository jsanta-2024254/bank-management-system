'use strict';
import { Router } from 'express';
import { getMyProfile, updateMyProfile } from './me.controller.js';
import { verifyToken, isCliente } from '../../middlewares/auth.middleware.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators.middleware.js';

const router = Router();

// GET /api/v1/me  – Ver perfil propio
router.get(
    '/',
    verifyToken,
    isCliente,
    getMyProfile
);

// PUT /api/v1/me  – Editar perfil propio (nombre, direccion, nombreTrabajo, ingresosMensuales)
router.put(
    '/',
    verifyToken,
    isCliente,
    [
        body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío').trim(),
        body('direccion').optional().notEmpty().withMessage('La dirección no puede estar vacía').trim(),
        body('nombreTrabajo').optional().notEmpty().withMessage('El nombre de trabajo no puede estar vacío').trim(),
        body('ingresosMensuales').optional().isFloat({ min: 100 }).withMessage('Los ingresos mensuales deben ser al menos Q100'),
    ],
    handleValidationErrors,
    updateMyProfile
);

export default router;