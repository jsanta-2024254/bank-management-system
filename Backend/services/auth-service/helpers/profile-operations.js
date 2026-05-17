import path from 'path';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User, UserProfile } from '../src/users/user-model.js';
import { ClientProfile } from '../src/users/clientProfile.model.js';
import { findUserById, updateUserPassword } from './user-db.js';
import { uploadImage, deleteImage } from './cloudinary-service.js';
import { buildUserResponse } from '../utils/user-helpers.js';
import { verifyPassword, hashPassword } from '../utils/password-utils.js';

const obtenerTextoLimpio = (valor) => {
  if (valor === undefined || valor === null) {
    return null;
  }

  const texto = String(valor).trim();
  return texto === '' ? null : texto;
};

const obtenerNombreArchivoPerfil = (rutaArchivo) => {
  const extension = path.extname(rutaArchivo || '.jpg') || '.jpg';
  const sufijo = crypto.randomBytes(6).toString('hex');

  return `profile-${sufijo}${extension}`;
};

const construirRespuestaPerfil = async (userId) => {
  const userWithRoles = await findUserById(userId);
  const perfilCliente = await ClientProfile.findOne({ where: { UserId: userId } });
  const respuesta = buildUserResponse(userWithRoles);

  return {
    ...respuesta,
    dpi: perfilCliente?.Dpi || '',
    direccion: perfilCliente?.Direccion || '',
    nombreTrabajo: perfilCliente?.NombreTrabajo || '',
    ingresosMensuales: perfilCliente?.IngresosMensuales || '',
  };
};

export const getUserProfileHelper = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }
  return construirRespuestaPerfil(userId);
};

export const updateUserProfileHelper = async (userId, profileData, profileFile) => {
  const transaction = await User.sequelize.transaction();
  let nuevaImagenPerfil = null;
  let imagenAnterior = null;

  try {
    const user = await User.findByPk(userId, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: ClientProfile, as: 'ClientProfile' },
      ],
      transaction,
    });

    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }

    const name = obtenerTextoLimpio(profileData.name || profileData.nombre);
    const surname = obtenerTextoLimpio(profileData.surname || profileData.apellido);
    const email = obtenerTextoLimpio(profileData.email);
    const phone = obtenerTextoLimpio(profileData.phone || profileData.celular);
    const dpi = obtenerTextoLimpio(profileData.dpi);

    const userUpdates = {};

    if (name) {
      userUpdates.Name = name;
    }

    if (surname) {
      userUpdates.Surname = surname;
    }

    if (email && email.toLowerCase() !== user.Email.toLowerCase()) {
      const emailEnUso = await User.findOne({
        where: {
          Email: { [Op.iLike]: email },
          Id: { [Op.ne]: userId },
        },
        transaction,
      });

      if (emailEnUso) {
        const err = new Error('El correo electrónico ya está en uso');
        err.status = 409;
        throw err;
      }

      userUpdates.Email = email.toLowerCase();
    }

    if (Object.keys(userUpdates).length > 0) {
      await user.update(userUpdates, { transaction });
    }

    const userProfileUpdates = {};

    if (phone) {
      userProfileUpdates.Phone = phone;
    }

    if (profileFile?.path) {
      const nombreArchivo = obtenerNombreArchivoPerfil(profileFile.originalname);
      nuevaImagenPerfil = await uploadImage(profileFile.path, nombreArchivo);
      imagenAnterior = user.UserProfile?.ProfilePicture || null;
      userProfileUpdates.ProfilePicture = nuevaImagenPerfil;
    }

    if (Object.keys(userProfileUpdates).length > 0) {
      const perfilUsuario = await UserProfile.findOne({
        where: { UserId: userId },
        transaction,
      });

      if (perfilUsuario) {
        await perfilUsuario.update(userProfileUpdates, { transaction });
      } else {
        await UserProfile.create(
          {
            UserId: userId,
            Phone: phone || '00000000',
            ProfilePicture: nuevaImagenPerfil || '',
          },
          { transaction }
        );
      }
    }

    if (dpi && user.ClientProfile) {
      await ClientProfile.update(
        { Dpi: dpi },
        {
          where: { UserId: userId },
          transaction,
        }
      );
    }

    const huboCambios =
      Object.keys(userUpdates).length > 0 ||
      Object.keys(userProfileUpdates).length > 0 ||
      (dpi && user.ClientProfile);

    if (!huboCambios) {
      const err = new Error('No se proporcionaron campos válidos para actualizar');
      err.status = 400;
      throw err;
    }

    await transaction.commit();

    if (nuevaImagenPerfil && imagenAnterior) {
      await deleteImage(imagenAnterior);
    }

    return construirRespuestaPerfil(userId);
  } catch (error) {
    await transaction.rollback();

    if (nuevaImagenPerfil) {
      await deleteImage(nuevaImagenPerfil);
    }

    throw error;
  }
};

export const changePasswordHelper = async (userId, currentPassword, newPassword) => {
  const user = await findUserById(userId);

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  const passwordValida = await verifyPassword(user.Password, currentPassword);

  if (!passwordValida) {
    const err = new Error('La contraseña actual es incorrecta');
    err.status = 400;
    throw err;
  }

  const mismaPassword = await verifyPassword(user.Password, newPassword);

  if (mismaPassword) {
    const err = new Error('La nueva contraseña debe ser diferente a la actual');
    err.status = 400;
    throw err;
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(userId, hashedPassword);

  return {
    success: true,
    message: 'Contraseña actualizada exitosamente',
  };
};