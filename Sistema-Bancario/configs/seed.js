'use strict';
import { User } from '../src/users/user-model.js';
import { hashPassword } from '../utils/password-utils.js';

export const seedAdmin = async () => {
    try {
        const exists = await User.findOne({ where: { Username: 'ADMINB' } });
        if (exists) {
            console.log('Admin ya existe, no se crea de nuevo.');
            return;
        }


        const hashedPassword = await hashPassword('ADMINB_2026!');

        await User.create({
            Name: 'Administrador',
            Surname: 'Principal',
            Username: 'adminb',
            Email: 'admin@bancokinal.gt',
            Password: hashedPassword,
            Status: true
        });

        console.log('Admin creado: usuario=adminb / password=ADMINB_2026!');
    } catch (error) {
        console.error('Error al crear el admin:', error.message);
    }
};