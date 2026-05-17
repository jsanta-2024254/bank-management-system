'use strict';
import mongoose from 'mongoose';
import Product from './product.model.js';
import ProductAcquisition from './productAcquisition.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';

const redondear = (valor) => Math.round((Number(valor) || 0) * 100) / 100;

const crearErrorHttp = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const obtenerUsuarioAutenticado = (req) => {
    return (
        req.user?.id ??
        req.user?.Id ??
        req.user?.userId ??
        req.user?.UserId ??
        req.user?.sub ??
        null
    );
};

const responderError = (res, error, mensajeGenerico) => {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? mensajeGenerico : error.message,
        error: statusCode === 500 ? error.message : undefined,
    });
};

const obtenerNumeroValido = (valor, nombreCampo, minimo = 0) => {
    const numero = Number(valor);

    if (!Number.isFinite(numero) || numero < minimo) {
        throw crearErrorHttp(400, `${nombreCampo} invalido`);
    }

    return numero;
};

const agregarMeses = (fechaBase, meses) => {
    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth() + meses);
    return fecha;
};

const obtenerTipoOperacion = (product) => {
    if (product.tipo === 'credito') return 'credito';
    if (product.tipo === 'suscripcion') return 'suscripcion';
    return 'compra';
};

const validarMontoCredito = ({ product, monto }) => {
    if (product.montoMinimo > 0 && monto < product.montoMinimo) {
        throw crearErrorHttp(
            400,
            `El monto minimo para este credito es Q${product.montoMinimo}`
        );
    }

    if (product.montoMaximo > 0 && monto > product.montoMaximo) {
        throw crearErrorHttp(
            400,
            `El monto maximo para este credito es Q${product.montoMaximo}`
        );
    }
};

const validarPlazoCredito = ({ product, plazoMeses }) => {
    if (plazoMeses < product.plazoMesesMinimo) {
        throw crearErrorHttp(
            400,
            `El plazo minimo para este credito es de ${product.plazoMesesMinimo} meses`
        );
    }

    if (plazoMeses > product.plazoMesesMaximo) {
        throw crearErrorHttp(
            400,
            `El plazo maximo para este credito es de ${product.plazoMesesMaximo} meses`
        );
    }
};

const calcularPrecioConDescuento = ({ precioBase, descuentoAppPorcentaje }) => {
    const descuentoAplicado = redondear(precioBase * (descuentoAppPorcentaje / 100));
    const montoFinal = redondear(precioBase - descuentoAplicado);

    return {
        precioBase: redondear(precioBase),
        descuentoAppPorcentaje: redondear(descuentoAppPorcentaje),
        descuentoAplicado,
        montoFinal,
    };
};

const generarCronogramaCredito = ({ monto, tasaInteres, plazoMeses }) => {
    const capitalTotal = redondear(monto);
    const interesTotal = redondear(capitalTotal * (tasaInteres / 100) * (plazoMeses / 12));
    const totalEstimado = redondear(capitalTotal + interesTotal);

    const capitalMensual = redondear(capitalTotal / plazoMeses);
    const interesMensual = redondear(interesTotal / plazoMeses);
    const cuotaMensual = redondear(totalEstimado / plazoMeses);

    const cronogramaPagos = Array.from({ length: plazoMeses }, (_, index) => {
        return {
            numeroCuota: index + 1,
            fechaPago: agregarMeses(new Date(), index + 1),
            capital: capitalMensual,
            interes: interesMensual,
            montoCuota: cuotaMensual,
            estado: 'pendiente',
        };
    });

    return {
        totalInteres: interesTotal,
        totalEstimado,
        cuotaMensualEstimada: cuotaMensual,
        cronogramaPagos,
    };
};

const calcularCotizacionProducto = ({ product, monto, plazoMeses }) => {
    const tipoOperacion = obtenerTipoOperacion(product);

    if (tipoOperacion === 'credito') {
        const montoCredito = obtenerNumeroValido(monto, 'Monto', 0.01);
        const plazo = obtenerNumeroValido(plazoMeses || product.plazoMesesMinimo, 'Plazo', 1);

        validarMontoCredito({ product, monto: montoCredito });
        validarPlazoCredito({ product, plazoMeses: plazo });

        const cronograma = generarCronogramaCredito({
            monto: montoCredito,
            tasaInteres: product.tasaInteres,
            plazoMeses: plazo,
        });

        return {
            tipoOperacion,
            precioBase: montoCredito,
            descuentoAppPorcentaje: 0,
            descuentoAplicado: 0,
            montoFinal: montoCredito,
            tasaInteresAplicada: redondear(product.tasaInteres),
            moraPorcentajeAplicada: redondear(product.moraPorcentaje),
            plazoMeses: plazo,
            ...cronograma,
        };
    }

    const precioBase =
        product.tipo === 'ahorro' || product.tipo === 'inversion'
            ? obtenerNumeroValido(monto || product.precio, 'Monto', 0.01)
            : obtenerNumeroValido(product.precio, 'Precio', 0.01);

    const precioConDescuento = calcularPrecioConDescuento({
        precioBase,
        descuentoAppPorcentaje: product.descuentoAppPorcentaje,
    });

    return {
        tipoOperacion,
        ...precioConDescuento,
        tasaInteresAplicada: redondear(product.tasaInteres),
        moraPorcentajeAplicada: 0,
        plazoMeses: null,
        totalInteres: 0,
        totalEstimado: precioConDescuento.montoFinal,
        cuotaMensualEstimada:
            tipoOperacion === 'suscripcion' ? precioConDescuento.montoFinal : null,
        cronogramaPagos: [],
        fechaProximoCobro:
            tipoOperacion === 'suscripcion' ? agregarMeses(new Date(), 1) : null,
    };
};

export const getProducts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const { tipo } = req.query;

        const filter = { estado: true };
        if (tipo) filter.tipo = tipo;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Product.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message,
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            estado: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message,
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            tipo,
            precio = 0,
            descuentoAppPorcentaje = 0,
            tasaInteres = 0,
            moraPorcentaje = 5,
            plazoMesesMinimo = 1,
            plazoMesesMaximo = 60,
            montoMinimo = 0,
            montoMaximo = 0,
        } = req.body;

        const product = new Product({
            nombre,
            descripcion,
            tipo,
            precio,
            descuentoAppPorcentaje,
            tasaInteres,
            moraPorcentaje,
            plazoMesesMinimo,
            plazoMesesMaximo,
            montoMinimo,
            montoMaximo,
            creadoPor: req.user.id,
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: product,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message,
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const camposPermitidos = [
            'nombre',
            'descripcion',
            'tipo',
            'precio',
            'descuentoAppPorcentaje',
            'tasaInteres',
            'moraPorcentaje',
            'plazoMesesMinimo',
            'plazoMesesMaximo',
            'montoMinimo',
            'montoMaximo',
            'estado',
        ];

        const updateData = {};

        camposPermitidos.forEach((campo) => {
            if (req.body[campo] !== undefined) {
                updateData[campo] = req.body[campo];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar',
            });
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, estado: true },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: product,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, estado: true },
            { $set: { estado: false } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message,
        });
    }
};

export const quoteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            estado: true,
        });

        if (!product) {
            throw crearErrorHttp(404, 'Producto no encontrado o no disponible');
        }

        const cotizacion = calcularCotizacionProducto({
            product,
            monto: req.body.monto,
            plazoMeses: req.body.plazoMeses,
        });

        return res.status(200).json({
            success: true,
            data: {
                producto: product,
                cotizacion,
            },
        });
    } catch (error) {
        return responderError(res, error, 'Error al cotizar el producto');
    }
};

export const acquireProduct = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const usuarioId = obtenerUsuarioAutenticado(req);
        const { cuentaId, monto, plazoMeses } = req.body;

        if (!usuarioId) {
            throw crearErrorHttp(401, 'No se pudo identificar al usuario autenticado');
        }

        session.startTransaction();

        const product = await Product.findOne({
            _id: req.params.id,
            estado: true,
        }).session(session);

        if (!product) {
            throw crearErrorHttp(404, 'Producto no encontrado o no disponible');
        }

        const account = await Account.findOne({
            _id: cuentaId,
            usuario: usuarioId,
            estado: true,
        }).session(session);

        if (!account) {
            throw crearErrorHttp(404, 'Cuenta no encontrada o no pertenece al usuario');
        }

        const cotizacion = calcularCotizacionProducto({
            product,
            monto,
            plazoMeses,
        });

        const saldoAnterior = redondear(account.saldo);
        let saldoPosterior = saldoAnterior;
        let tipoTransaccion = 'compra';
        let cuentaOrigen = account._id;
        let cuentaDestino = null;
        let descripcionTransaccion = `Adquisición de producto: ${product.nombre}`;

        if (cotizacion.tipoOperacion === 'credito') {
            tipoTransaccion = 'credito';
            cuentaOrigen = null;
            cuentaDestino = account._id;
            saldoPosterior = redondear(saldoAnterior + cotizacion.montoFinal);
            descripcionTransaccion = `Desembolso de crédito: ${product.nombre}`;
        } else {
            if (saldoAnterior < cotizacion.montoFinal) {
                throw crearErrorHttp(400, 'Saldo insuficiente para adquirir este producto');
            }

            saldoPosterior = redondear(saldoAnterior - cotizacion.montoFinal);
        }

        account.saldo = saldoPosterior;
        await account.save({ session });

        const [transaction] = await Transaction.create(
            [
                {
                    tipo: tipoTransaccion,
                    monto: cotizacion.montoFinal,
                    descripcion: descripcionTransaccion,
                    cuentaOrigen,
                    cuentaDestino,
                    saldoAnteriorOrigen:
                        cotizacion.tipoOperacion === 'credito' ? null : saldoAnterior,
                    saldoPosteriorOrigen:
                        cotizacion.tipoOperacion === 'credito' ? null : saldoPosterior,
                    saldoAnteriorDestino:
                        cotizacion.tipoOperacion === 'credito' ? saldoAnterior : null,
                    saldoPosteriorDestino:
                        cotizacion.tipoOperacion === 'credito' ? saldoPosterior : null,
                    ejecutadaPor: usuarioId,
                },
            ],
            { session }
        );

        const [acquisition] = await ProductAcquisition.create(
            [
                {
                    usuario: usuarioId,
                    producto: product._id,
                    cuenta: account._id,
                    tipoOperacion: cotizacion.tipoOperacion,
                    precioBase: cotizacion.precioBase,
                    descuentoAppPorcentaje: cotizacion.descuentoAppPorcentaje,
                    descuentoAplicado: cotizacion.descuentoAplicado,
                    monto: cotizacion.montoFinal,
                    tasaInteresAplicada: cotizacion.tasaInteresAplicada,
                    moraPorcentajeAplicada: cotizacion.moraPorcentajeAplicada,
                    plazoMeses: cotizacion.plazoMeses,
                    totalInteres: cotizacion.totalInteres,
                    totalEstimado: cotizacion.totalEstimado,
                    cuotaMensualEstimada: cotizacion.cuotaMensualEstimada,
                    cronogramaPagos: cotizacion.cronogramaPagos,
                    fechaProximoCobro: cotizacion.fechaProximoCobro,
                    beneficio:
                        cotizacion.tipoOperacion === 'credito'
                            ? `Crédito acreditado a la cuenta ${account.numeroCuenta}`
                            : `Producto adquirido desde la app: ${product.nombre}`,
                    transaccion: transaction._id,
                },
            ],
            { session }
        );

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message:
                cotizacion.tipoOperacion === 'credito'
                    ? 'Crédito adquirido y acreditado correctamente'
                    : cotizacion.tipoOperacion === 'suscripcion'
                      ? 'Suscripción activada y primer mes cobrado correctamente'
                      : 'Producto adquirido correctamente',
            data: acquisition,
            nuevoSaldo: account.saldo,
            cotizacion,
            transaccion: transaction,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        return responderError(res, error, 'Error al adquirir el producto');
    } finally {
        await session.endSession();
    }
};

export const getMyProductAcquisitions = async (req, res) => {
    try {
        const usuarioId = obtenerUsuarioAutenticado(req);

        if (!usuarioId) {
            throw crearErrorHttp(401, 'No se pudo identificar al usuario autenticado');
        }

        const acquisitions = await ProductAcquisition.find({ usuario: usuarioId })
            .populate('producto', 'nombre tipo precio descuentoAppPorcentaje tasaInteres moraPorcentaje descripcion')
            .populate('cuenta', 'numeroCuenta tipoCuenta saldo')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: acquisitions,
        });
    } catch (error) {
        return responderError(res, error, 'Error al obtener productos adquiridos');
    }
};

export const payCreditInstallment = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const usuarioId = obtenerUsuarioAutenticado(req);
        const { cuentaId } = req.body;

        if (!usuarioId) {
            throw crearErrorHttp(401, 'No se pudo identificar al usuario autenticado');
        }

        session.startTransaction();

        const acquisition = await ProductAcquisition.findOne({
            _id: req.params.acquisitionId,
            usuario: usuarioId,
            tipoOperacion: 'credito',
            estado: 'activa',
        }).session(session);

        if (!acquisition) {
            throw crearErrorHttp(404, 'Crédito no encontrado o no está activo');
        }

        const cuota = acquisition.cronogramaPagos.id(req.params.paymentId);

        if (!cuota) {
            throw crearErrorHttp(404, 'Cuota no encontrada');
        }

        if (cuota.estado === 'pagada') {
            throw crearErrorHttp(400, 'Esta cuota ya fue pagada');
        }

        const account = await Account.findOne({
            _id: cuentaId,
            usuario: usuarioId,
            estado: true,
        }).session(session);

        if (!account) {
            throw crearErrorHttp(404, 'Cuenta no encontrada o no pertenece al usuario');
        }

        const fechaActual = new Date();
        const estaEnMora = fechaActual > new Date(cuota.fechaPago);
        const moraAplicada = estaEnMora
            ? redondear(cuota.montoCuota * (acquisition.moraPorcentajeAplicada / 100))
            : 0;

        const montoTotalPago = redondear(cuota.montoCuota + moraAplicada);
        const saldoAnterior = redondear(account.saldo);

        if (saldoAnterior < montoTotalPago) {
            throw crearErrorHttp(
                400,
                `Saldo insuficiente. Debe pagar Q${montoTotalPago}`
            );
        }

        account.saldo = redondear(saldoAnterior - montoTotalPago);
        await account.save({ session });

        const [transaction] = await Transaction.create(
            [
                {
                    tipo: 'compra',
                    monto: montoTotalPago,
                    descripcion: `Pago de cuota ${cuota.numeroCuota} del crédito ${acquisition._id}`,
                    cuentaOrigen: account._id,
                    cuentaDestino: null,
                    saldoAnteriorOrigen: saldoAnterior,
                    saldoPosteriorOrigen: account.saldo,
                    ejecutadaPor: usuarioId,
                },
            ],
            { session }
        );

        cuota.estado = 'pagada';
        cuota.moraAplicada = moraAplicada;
        cuota.montoPagado = montoTotalPago;
        cuota.fechaPagado = fechaActual;

        const cuotasPendientes = acquisition.cronogramaPagos.some(
            (item) => item.estado !== 'pagada'
        );

        if (!cuotasPendientes) {
            acquisition.estado = 'finalizada';
        }

        await acquisition.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: estaEnMora
                ? 'Cuota pagada con mora aplicada'
                : 'Cuota pagada correctamente',
            data: acquisition,
            cuotaPagada: cuota,
            moraAplicada,
            montoTotalPago,
            nuevoSaldo: account.saldo,
            transaccion: transaction,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        return responderError(res, error, 'Error al pagar la cuota del crédito');
    } finally {
        await session.endSession();
    }
};