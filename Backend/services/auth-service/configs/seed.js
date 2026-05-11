'use strict';
import { User, UserProfile, UserEmail, UserPasswordReset } from '../src/users/user-model.js';
import { UserRole, Role } from '../src/auth/role.model.js';
import { hashPassword } from '../utils/password-utils.js';
import { ADMIN_ROLE } from '../helpers/role-constants.js';

export const seedAdmin = async () => {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@sistemabancario.com';

        // Si ya existe no lo vuelve a crear
        const exists = await User.findOne({
            where: { Username: adminUsername }
        });
        if (exists) {
            console.log(` Admin ya existe (usuario: ${adminUsername}), no se crea de nuevo.`);
            return;
        }

        const transaction = await User.sequelize.transaction();
        try {
            const hashedPassword = await hashPassword(
                process.env.ADMIN_PASSWORD || 'Admin1234!'
            );

            const admin = await User.create({
                Name:     process.env.ADMIN_NAME    || 'Admin',
                Surname:  process.env.ADMIN_SURNAME || 'Principal',
                Username: adminUsername,
                Email:    adminEmail,
                Password: hashedPassword,
                Status:   true
            }, { transaction });

            await UserProfile.create({
                UserId: admin.Id,
                Phone:  process.env.ADMIN_PHONE || '55555555',
            }, { transaction });

            await UserEmail.create({
                UserId:        admin.Id,
                EmailVerified: true,
            }, { transaction });

            await UserPasswordReset.create({
                UserId: admin.Id,
            }, { transaction });

            // Asignar rol ADMIN_ROLE
            const adminRole = await Role.findOne(
                { where: { Name: ADMIN_ROLE } },
                { transaction }
            );
            if (adminRole) {
                await UserRole.create({
                    UserId: admin.Id,
                    RoleId: adminRole.Id,
                }, { transaction });
            } else {
                console.warn('  Rol ADMIN_ROLE no encontrado en BD. Asegúrate de correr el seed de roles primero.');
            }

            await transaction.commit();
            console.log(`Admin creado exitosamente:`);
            console.log(`   Usuario  : ${adminUsername}`);
            console.log(`   Email    : ${adminEmail}`);
            console.log(`   Password : ${process.env.ADMIN_PASSWORD || 'Admin1234!'}`);
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error(' Error al crear el admin:', error.message);
    }
};