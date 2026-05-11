'use strict';
import Account from '../src/accounts/account.model.js';

export const generateAccountNumber = async () => {
    let numeroCuenta;
    let exists = true;

    while (exists) {
        // Genera número de 10 dígitos aleatorio con prefijo 2026
        numeroCuenta = '2026' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const found = await Account.findOne({ numeroCuenta });
        exists = !!found;
    }

    return numeroCuenta;
};