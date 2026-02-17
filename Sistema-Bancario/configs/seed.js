'use strict';
import User from '../src/users/user.model.js';

export const seedAdmin = async () => {
    try {
        const exists = await User.findOne({ username: 'ADMINB', rol: 'admin' });
        if (exists) {
            console.log('Admin ya existe, no se crea de nuevo.');
            return;
        }

        await User.create({
            nombre: 'Administrador Principal',
            username: 'ADMINB',
            email: 'admin@bancokinal.gt',
            password: 'ADMINB',
            dpi: '1234567890123',
            direccion: 'Banco Kinal, Guatemala',
            celular: '55555555',
            nombreTrabajo: 'Banco Kinal',
            ingresosMensuales: 50000,
            rol: 'admin'
        });

        console.log('Admin creado: usuario=ADMINB / password=ADMINB');
    } catch (error) {
        console.error('Error al crear el admin:', error.message);
    }
};