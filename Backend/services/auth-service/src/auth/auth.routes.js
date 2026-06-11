import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  authRateLimit,
  requestLimit,
} from '../../middlewares/request-limit.js';
import { upload, handleUploadError } from '../../helpers/file-upload.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  validateSendTwoFactor,
  validateVerifyTwoFactor,
  validateUpdateProfile,
  validateChangePassword,
} from '../../middlewares/validation.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registra un nuevo usuario
 *     description: Crea una nueva cuenta de usuario con validaciones de seguridad
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - username
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *               surname:
 *                 type: string
 *                 description: Apellido del usuario
 *               username:
 *                 type: string
 *                 description: Nombre de usuario único
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña (mínimo 8 caracteres)
 *               phone:
 *                 type: string
 *                 description: Teléfono (8 dígitos)
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de perfil (opcional)
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Errores de validación
 *       409:
 *         description: Email o username ya existe
 */
router.post(
  '/register',
  authRateLimit,
  upload.single('profilePicture'),
  handleUploadError,
  validateRegister,
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Autentica un usuario
 *     description: Inicia sesión con email/username y contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrUsername
 *               - password
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 description: Email o nombre de usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 *       423:
 *         description: Cuenta bloqueada
 */
router.post('/login', authRateLimit, validateLogin, authController.login);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Verifica el email del usuario
 *     description: Confirma la dirección de email usando el token enviado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de verificación de email
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post(
  '/verify-email',
  requestLimit,
  validateVerifyEmail,
  authController.verifyEmail
);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     tags: [Authentication]
 *     summary: Reenvía el email de verificación
 *     description: Envía nuevamente el email de verificación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *     responses:
 *       200:
 *         description: Email reenviado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.post(
  '/resend-verification',
  authRateLimit,
  validateResendVerification,
  authController.resendVerification
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Inicia recuperación de contraseña
 *     description: Envía email con token para resetear contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *     responses:
 *       200:
 *         description: Instrucciones enviadas al email
 */
router.post(
  '/forgot-password',
  authRateLimit,
  validateForgotPassword,
  authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Resetea la contraseña
 *     description: Cambia la contraseña usando el token de recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de recuperación de contraseña
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post(
  '/reset-password',
  authRateLimit,
  validateResetPassword,
  authController.resetPassword
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Obtiene el perfil del usuario autenticado
 *     description: Devuelve la información del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Email no verificado
 */
router.get('/profile', validateJWT, authController.getProfile);

router.put(
  '/profile',
  validateJWT,
  upload.single('profilePicture'),
  handleUploadError,
  validateUpdateProfile,
  authController.updateProfile
);

router.put(
  '/change-password',
  validateJWT,
  validateChangePassword,
  authController.changePassword
);

/**
 * @swagger
 * /auth/profile/by-id:
 *   post:
 *     tags: [Profile]
 *     summary: Obtiene el perfil de un usuario por ID
 *     description: Devuelve la información del usuario basándose en el userId proporcionado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       400:
 *         description: userId no proporcionado
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/profile/by-id', requestLimit, validateJWT, authController.getProfileById);

/**
 * @swagger
 * /auth/send-2fa:
 *   post:
 *     tags: [Authentication]
 *     summary: Envía código de verificación 2FA al correo
 *     description: Genera un código de 6 dígitos y lo envía al correo del usuario. Expira en 5 minutos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrUsername
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 description: Email o username del usuario
 *     responses:
 *       200:
 *         description: Código 2FA enviado exitosamente al correo
 *       403:
 *         description: Email del usuario no está verificado
 *       404:
 *         description: Usuario no encontrado
 */
router.post(
  '/send-2fa',
  authRateLimit,
  validateSendTwoFactor,
  authController.sendTwoFactor
);

/**
 * @swagger
 * /auth/verify-2fa:
 *   post:
 *     tags: [Authentication]
 *     summary: Verifica el código 2FA y devuelve JWT de sesión
 *     description: Valida el código de 6 dígitos recibido por correo y retorna el token JWT
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrUsername
 *               - code
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 description: Email o username del usuario
 *               code:
 *                 type: string
 *                 description: Código de 6 dígitos recibido por correo
 *     responses:
 *       200:
 *         description: 2FA verificado, JWT retornado
 *       401:
 *         description: Código incorrecto, expirado o ya utilizado
 *       404:
 *         description: Usuario no encontrado
 */
router.post(
  '/verify-2fa',
  authRateLimit,
  validateVerifyTwoFactor,
  authController.verifyTwoFactor
);

export default router;