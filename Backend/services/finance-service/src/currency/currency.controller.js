'use strict';
import Account from '../accounts/account.model.js';

// GET /api/currency/convert?from=GTQ&to=USD&amount=500
export const convertCurrency = async (req, res) => {
    try {
        const { from = 'GTQ', to, amount, accountId } = req.query;

        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'El parametro "to" (moneda destino) es requerido. Ejemplo: ?to=USD'
            });
        }

        let montoAConvertir = parseFloat(amount);

        // Si el cliente pasa su accountId, usar el saldo de esa cuenta
        if (accountId) {
            const account = await Account.findOne({ _id: accountId, estado: true });
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Cuenta no encontrada'
                });
            }
            // El cliente solo puede ver su propia cuenta
            if (account.usuario.toString() !== req.user.id && req.user.rol !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para ver esta cuenta'
                });
            }
            montoAConvertir = account.saldo;
        }

        if (!montoAConvertir || montoAConvertir <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor que 0'
            });
        }

        // Llamada a la API externa de divisas (ExchangeRate-API)
        const apiKey  = process.env.CURRENCY_API_KEY;
        const apiUrl  = process.env.CURRENCY_API_URL;
        const url     = `${apiUrl}/${apiKey}/pair/${from}/${to}/${montoAConvertir}`;

        const response = await fetch(url);
        const data     = await response.json();

        if (data.result !== 'success') {
            return res.status(400).json({
                success: false,
                message: 'Error al consultar la API de divisas. Verifica las monedas ingresadas.',
                error: data['error-type'] || 'unknown'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                monedaOrigen:    from.toUpperCase(),
                monedaDestino:   to.toUpperCase(),
                montoOriginal:   montoAConvertir,
                montoConvertido: data.conversion_result,
                tasaDeCambio:    data.conversion_rate,
                fechaActualizacion: data.time_last_update_utc
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al convertir la divisa',
            error: error.message
        });
    }
};
