'use strict';
import mongoose from 'mongoose';
import Product from './product.model.js';
import ProductAcquisition from './productAcquisition.model.js';
import CreditRequest from './creditRequest.model.js';
import Account from '../accounts/account.model.js';
import Transaction from '../transactions/transaction.model.js';

const redondear = (valor) => Math.round((Number(valor) || 0) * 100) / 100;

const crearErrorHttp = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const responderError = (res, error, mensajeGenerico) => {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? mensajeGenerico : error.message,
        error: statusCode === 500 ? error.message : undefined,
    });
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

const obtenerNumeroValido = (valor, nombreCampo, minimo = 0) => {
    const numero = Number(valor);

    if (!Number.isFinite(numero) || numero < minimo) {
        throw crearErrorHttp(400, `${nombreCampo} invalido`);
    }

    return numero;
};

const obtenerEnteroValido = (valor, nombreCampo, minimo = 1) => {
    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero < minimo) {
        throw crearErrorHttp(400, `${nombreCampo} invalido`);
    }

    return numero;
};

const agregarMeses = (fechaBase, meses) => {
    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth() + meses);
    return fecha;
};

const esProductoCredito = (product) => product.tipo === 'credito';

const obtenerTipoOperacionProducto = (product, numeroCuotas) => {
    if (product.tipo === 'suscripcion') return 'suscripcion';
    if (product.tipo === 'ahorro') return 'ahorro';
    if (product.tipo === 'inversion') return 'inversion';
    if (numeroCuotas > 1) return 'compra_cuotas';
    return 'compra';
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

const validarCuotasProducto = ({ product, numeroCuotas }) => {
    if (numeroCuotas < 1) {
        throw crearErrorHttp(400, 'La cantidad de cuotas debe ser mayor o igual a 1');
    }

    if (numeroCuotas > 1 && !product.permitePagoCuotas) {
        throw crearErrorHttp(400, 'Este producto no permite pago en cuotas');
    }

    if (product.permitePagoCuotas && numeroCuotas < product.cuotasMinimas) {
        throw crearErrorHttp(
            400,
            `La cantidad minima de cuotas para este producto es ${product.cuotasMinimas}`
        );
    }

    if (product.permitePagoCuotas && numeroCuotas > product.cuotasMaximas) {
        throw crearErrorHttp(
            400,
            `La cantidad maxima de cuotas para este producto es ${product.cuotasMaximas}`
        );
    }
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

const generarCronogramaSinInteres = ({ montoTotal, numeroCuotas }) => {
    const total = redondear(montoTotal);
    const cuotaBase = redondear(total / numeroCuotas);
    let acumulado = 0;

    return Array.from({ length: numeroCuotas }, (_, index) => {
        const esUltimaCuota = index === numeroCuotas - 1;
        const montoCuota = esUltimaCuota ? redondear(total - acumulado) : cuotaBase;
        acumulado = redondear(acumulado + montoCuota);

        return {
            numeroCuota: index + 1,
            fechaPago: agregarMeses(new Date(), index),
            capital: montoCuota,
            interes: 0,
            montoCuota,
            estado: index === 0 ? 'pagada' : 'pendiente',
            montoPagado: index === 0 ? montoCuota : 0,
            fechaPagado: index === 0 ? new Date() : null,
        };
    });
};

const generarCronogramaCredito = ({ monto, tasaInteres, plazoMeses }) => {
    const capitalTotal = redondear(monto);
    const interesTotal = redondear(capitalTotal * (tasaInteres / 100) * (plazoMeses / 12));
    const totalEstimado = redondear(capitalTotal + interesTotal);

    const capitalMensual = redondear(capitalTotal / plazoMeses);
    const interesMensual = redondear(interesTotal / plazoMeses);
    const cuotaMensual = redondear(totalEstimado / plazoMeses);
    let totalAsignado = 0;

    const cronogramaPagos = Array.from({ length: plazoMeses }, (_, index) => {
        const esUltimaCuota = index === plazoMeses - 1;
        const montoCuota = esUltimaCuota
            ? redondear(totalEstimado - totalAsignado)
            : cuotaMensual;

        totalAsignado = redondear(totalAsignado + montoCuota);

        return {
            numeroCuota: index + 1,
            fechaPago: agregarMeses(new Date(), index + 1),
            capital: capitalMensual,
            interes: interesMensual,
            montoCuota,
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

const calcularCotizacionProducto = ({ product, numeroCuotas }) => {
    if (esProductoCredito(product)) {
        throw crearErrorHttp(
            400,
            'Las oportunidades de credito se solicitan y requieren aprobación administrativa antes del desembolso'
        );
    }

    const cuotas = obtenerEnteroValido(numeroCuotas || 1, 'Cantidad de cuotas', 1);
    validarCuotasProducto({ product, numeroCuotas: cuotas });

    const precioConDescuento = calcularPrecioConDescuento({
        precioBase: obtenerNumeroValido(product.precio, 'Precio', 0.01),
        descuentoAppPorcentaje: product.descuentoAppPorcentaje,
    });

    const cronogramaPagos = cuotas > 1
        ? generarCronogramaSinInteres({
              montoTotal: precioConDescuento.montoFinal,
              numeroCuotas: cuotas,
          })
        : [];

    const montoCobradoInicial = cuotas > 1
        ? redondear(cronogramaPagos[0].montoCuota)
        : precioConDescuento.montoFinal;

    const totalPendiente = redondear(precioConDescuento.montoFinal - montoCobradoInicial);

    return {
        tipoOperacion: obtenerTipoOperacionProducto(product, cuotas),
        ...precioConDescuento,
        numeroCuotas: cuotas,
        montoCobradoInicial,
        totalPagado: montoCobradoInicial,
        totalPendiente,
        totalEstimado: precioConDescuento.montoFinal,
        cuotaMensualEstimada: cuotas > 1 ? redondear(precioConDescuento.montoFinal / cuotas) : null,
        cronogramaPagos,
        fechaProximoCobro:
            product.tipo === 'suscripcion' || cuotas > 1 ? agregarMeses(new Date(), 1) : null,
    };
};

const calcularCotizacionCredito = ({ product, monto, plazoMeses }) => {
    const montoCredito = obtenerNumeroValido(monto, 'Monto', 0.01);
    const plazo = obtenerEnteroValido(plazoMeses, 'Plazo', 1);

    if (product) {
        validarMontoCredito({ product, monto: montoCredito });
        validarPlazoCredito({ product, plazoMeses: plazo });
    }

    const tasaInteres = product ? redondear(product.tasaInteres) : 0;
    const moraPorcentaje = product ? redondear(product.moraPorcentaje) : 0;
    const cronograma = generarCronogramaCredito({
        monto: montoCredito,
        tasaInteres,
        plazoMeses: plazo,
    });

    return {
        montoSolicitado: montoCredito,
        plazoMeses: plazo,
        tasaInteresAplicada: tasaInteres,
        moraPorcentajeAplicada: moraPorcentaje,
        ...cronograma,
    };
};

const obtenerCuentaUsuario = async ({ cuentaId, usuarioId, session }) => {
    const account = await Account.findOne({
        _id: cuentaId,
        usuario: usuarioId,
        estado: true,
    }).session(session || null);

    if (!account) {
        throw crearErrorHttp(404, 'Cuenta no encontrada o no pertenece al usuario');
    }

    return account;
};

const construirPayloadProducto = (body, usuarioId) => {
    const payload = {
        nombre: body.nombre,
        descripcion: body.descripcion,
        tipo: body.tipo,
        creadoPor: usuarioId,
    };

    if (body.tipo === 'credito') {
        payload.tasaInteres = Number(body.tasaInteres || 0);
        payload.moraPorcentaje = Number(body.moraPorcentaje || 5);
        payload.plazoMesesMinimo = Number(body.plazoMesesMinimo || 1);
        payload.plazoMesesMaximo = Number(body.plazoMesesMaximo || 60);
        payload.montoMinimo = Number(body.montoMinimo || 0);
        payload.montoMaximo = Number(body.montoMaximo || 0);
        payload.requiereAprobacion = true;
        return payload;
    }

    payload.precio = Number(body.precio || 0);
    payload.descuentoAppPorcentaje = Number(body.descuentoAppPorcentaje || 0);
    payload.permitePagoCuotas = body.permitePagoCuotas === true || body.permitePagoCuotas === 'true';
    payload.cuotasMinimas = Number(body.cuotasMinimas || 1);
    payload.cuotasMaximas = Number(body.cuotasMaximas || 1);
    payload.tasaInteres = 0;
    payload.moraPorcentaje = 0;
    payload.plazoMesesMinimo = 1;
    payload.plazoMesesMaximo = 1;
    payload.montoMinimo = 0;
    payload.montoMaximo = 0;
    payload.requiereAprobacion = false;

    return payload;
};

const construirActualizacionProducto = (body) => {
    const payload = {};
    const camposGenerales = ['nombre', 'descripcion', 'tipo', 'estado'];

    camposGenerales.forEach((campo) => {
        if (body[campo] !== undefined) payload[campo] = body[campo];
    });

    const tipo = payload.tipo || body.tipo;

    if (tipo === 'credito') {
        [
            'tasaInteres',
            'moraPorcentaje',
            'plazoMesesMinimo',
            'plazoMesesMaximo',
            'montoMinimo',
            'montoMaximo',
        ].forEach((campo) => {
            if (body[campo] !== undefined) payload[campo] = Number(body[campo]);
        });

        payload.precio = 0;
        payload.descuentoAppPorcentaje = 0;
        payload.permitePagoCuotas = false;
        payload.cuotasMinimas = 1;
        payload.cuotasMaximas = 1;
        payload.requiereAprobacion = true;

        return payload;
    }

    ['precio', 'descuentoAppPorcentaje', 'cuotasMinimas', 'cuotasMaximas'].forEach((campo) => {
        if (body[campo] !== undefined) payload[campo] = Number(body[campo]);
    });

    if (body.permitePagoCuotas !== undefined) {
        payload.permitePagoCuotas = body.permitePagoCuotas === true || body.permitePagoCuotas === 'true';
    }

    if (tipo && tipo !== 'credito') {
        payload.tasaInteres = 0;
        payload.moraPorcentaje = 0;
        payload.plazoMesesMinimo = 1;
        payload.plazoMesesMaximo = 1;
        payload.montoMinimo = 0;
        payload.montoMaximo = 0;
        payload.requiereAprobacion = false;
    }

    return payload;
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
        const usuarioId = obtenerUsuarioAutenticado(req);
        const payload = construirPayloadProducto(req.body, usuarioId);
        const product = new Product(payload);

        await product.save();

        res.status(201).json({
            success: true,
            message:
                product.tipo === 'credito'
                    ? 'Oportunidad de credito creada exitosamente'
                    : 'Producto creado exitosamente',
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
        const updateData = construirActualizacionProducto(req.body);

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

        const cotizacion = esProductoCredito(product)
            ? calcularCotizacionCredito({
                  product,
                  monto: req.body.monto,
                  plazoMeses: req.body.plazoMeses,
              })
            : calcularCotizacionProducto({
                  product,
                  numeroCuotas: req.body.numeroCuotas,
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
        const { cuentaId, numeroCuotas } = req.body;

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

        if (esProductoCredito(product)) {
            throw crearErrorHttp(
                400,
                'Una oportunidad de credito no se adquiere como producto. Debe enviarse una solicitud y esperar aprobación administrativa.'
            );
        }

        const account = await obtenerCuentaUsuario({ cuentaId, usuarioId, session });
        const cotizacion = calcularCotizacionProducto({
            product,
            numeroCuotas,
        });

        const saldoAnterior = redondear(account.saldo);

        if (saldoAnterior < cotizacion.montoCobradoInicial) {
            throw crearErrorHttp(400, 'Saldo insuficiente para adquirir este producto');
        }

        const saldoPosterior = redondear(saldoAnterior - cotizacion.montoCobradoInicial);
        account.saldo = saldoPosterior;
        await account.save({ session });

        const [transaction] = await Transaction.create(
            [
                {
                    tipo: 'compra',
                    monto: cotizacion.montoCobradoInicial,
                    descripcion:
                        cotizacion.numeroCuotas > 1
                            ? `Pago inicial de ${product.nombre} en ${cotizacion.numeroCuotas} cuotas`
                            : `Adquisicion de producto: ${product.nombre}`,
                    cuentaOrigen: account._id,
                    cuentaDestino: null,
                    saldoAnteriorOrigen: saldoAnterior,
                    saldoPosteriorOrigen: saldoPosterior,
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
                    numeroCuotas: cotizacion.numeroCuotas,
                    montoCobradoInicial: cotizacion.montoCobradoInicial,
                    totalPagado: cotizacion.totalPagado,
                    totalPendiente: cotizacion.totalPendiente,
                    totalEstimado: cotizacion.totalEstimado,
                    cuotaMensualEstimada: cotizacion.cuotaMensualEstimada,
                    cronogramaPagos: cotizacion.cronogramaPagos,
                    fechaProximoCobro: cotizacion.fechaProximoCobro,
                    beneficio:
                        cotizacion.numeroCuotas > 1
                            ? `Producto adquirido en ${cotizacion.numeroCuotas} cuotas`
                            : `Producto adquirido desde la app: ${product.nombre}`,
                    transaccion: transaction._id,
                    transacciones: [transaction._id],
                    estado:
                        product.tipo === 'suscripcion' || cotizacion.totalPendiente > 0
                            ? 'activa'
                            : 'finalizada',
                },
            ],
            { session }
        );

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message:
                cotizacion.numeroCuotas > 1
                    ? 'Producto adquirido en cuotas correctamente'
                    : product.tipo === 'suscripcion'
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
            .populate(
                'producto',
                'nombre tipo precio descuentoAppPorcentaje permitePagoCuotas cuotasMinimas cuotasMaximas descripcion'
            )
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

export const payProductInstallment = async (req, res) => {
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
            estado: 'activa',
        }).session(session);

        if (!acquisition) {
            throw crearErrorHttp(404, 'Adquisición no encontrada o no está activa');
        }

        const cuota = acquisition.cronogramaPagos.id(req.params.paymentId);

        if (!cuota) {
            throw crearErrorHttp(404, 'Cuota no encontrada');
        }

        if (cuota.estado === 'pagada') {
            throw crearErrorHttp(400, 'Esta cuota ya fue pagada');
        }

        const account = await obtenerCuentaUsuario({ cuentaId, usuarioId, session });
        const montoTotalPago = redondear(cuota.montoCuota);
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
                    descripcion: `Pago de cuota ${cuota.numeroCuota} de la adquisición ${acquisition._id}`,
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
        cuota.montoPagado = montoTotalPago;
        cuota.fechaPagado = new Date();

        acquisition.totalPagado = redondear(acquisition.totalPagado + montoTotalPago);
        acquisition.totalPendiente = Math.max(
            0,
            redondear(acquisition.totalEstimado - acquisition.totalPagado)
        );
        acquisition.transacciones.push(transaction._id);

        const cuotasPendientes = acquisition.cronogramaPagos.some(
            (item) => item.estado !== 'pagada'
        );

        if (!cuotasPendientes) {
            acquisition.estado = 'finalizada';
            acquisition.fechaProximoCobro = null;
        } else {
            const proximaCuota = acquisition.cronogramaPagos.find(
                (item) => item.estado !== 'pagada'
            );
            acquisition.fechaProximoCobro = proximaCuota?.fechaPago || null;
        }

        await acquisition.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: 'Cuota pagada correctamente',
            data: acquisition,
            cuotaPagada: cuota,
            montoTotalPago,
            nuevoSaldo: account.saldo,
            transaccion: transaction,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        return responderError(res, error, 'Error al pagar la cuota');
    } finally {
        await session.endSession();
    }
};

export const requestCreditFromOpportunity = async (req, res) => {
    try {
        const usuarioId = obtenerUsuarioAutenticado(req);
        const { cuentaId, monto, montoSolicitado, plazoMeses, comentarioCliente } = req.body;
        const montoCredito = montoSolicitado ?? monto;

        if (!usuarioId) {
            throw crearErrorHttp(401, 'No se pudo identificar al usuario autenticado');
        }

        const product = await Product.findOne({
            _id: req.params.id,
            estado: true,
            tipo: 'credito',
        });

        if (!product) {
            throw crearErrorHttp(404, 'Oportunidad de credito no encontrada o no disponible');
        }

        const account = await obtenerCuentaUsuario({ cuentaId, usuarioId });
        const cotizacion = calcularCotizacionCredito({ product, monto: montoCredito, plazoMeses });

        const creditRequest = await CreditRequest.create({
            usuario: usuarioId,
            producto: product._id,
            cuenta: account._id,
            origenSolicitud: 'oportunidad_banco',
            nombre: product.nombre,
            descripcion: product.descripcion,
            montoSolicitado: cotizacion.montoSolicitado,
            plazoMeses: cotizacion.plazoMeses,
            tasaInteresAplicada: cotizacion.tasaInteresAplicada,
            moraPorcentajeAplicada: cotizacion.moraPorcentajeAplicada,
            totalInteres: cotizacion.totalInteres,
            totalEstimado: cotizacion.totalEstimado,
            cuotaMensualEstimada: cotizacion.cuotaMensualEstimada,
            comentarioCliente,
            estado: 'pendiente',
        });

        return res.status(201).json({
            success: true,
            message: 'Solicitud de credito enviada. Queda pendiente de aprobación administrativa.',
            data: creditRequest,
            cotizacion,
        });
    } catch (error) {
        return responderError(res, error, 'Error al solicitar el credito');
    }
};

export const createClientCreditRequest = async (req, res) => {
    try {
        const usuarioId = obtenerUsuarioAutenticado(req);
        const { cuentaId, monto, montoSolicitado, plazoMeses, comentarioCliente } = req.body;
        const montoCredito = montoSolicitado ?? monto;

        if (!usuarioId) {
            throw crearErrorHttp(401, 'No se pudo identificar al usuario autenticado');
        }

        const account = await obtenerCuentaUsuario({ cuentaId, usuarioId });
        const montoValidado = obtenerNumeroValido(montoCredito, 'Monto', 0.01);
        const plazo = obtenerEnteroValido(plazoMeses, 'Plazo', 1);

        const creditRequest = await CreditRequest.create({
            usuario: usuarioId,
            producto: null,
            cuenta: account._id,
            origenSolicitud: 'solicitud_cliente',
            nombre: 'Solicitud de credito personalizada',
            descripcion: comentarioCliente || null,
            montoSolicitado: montoValidado,
            plazoMeses: plazo,
            comentarioCliente,
            estado: 'pendiente',
        });

        return res.status(201).json({
            success: true,
            message: 'Solicitud de credito enviada. Queda pendiente de revisión administrativa.',
            data: creditRequest,
        });
    } catch (error) {
        return responderError(res, error, 'Error al crear la solicitud de credito');
    }
};

export const getMyCreditRequests = async (req, res) => {
    try {
        const usuarioId = obtenerUsuarioAutenticado(req);

        if (!usuarioId) {
            throw crearErrorHttp(401, 'No se pudo identificar al usuario autenticado');
        }

        const requests = await CreditRequest.find({ usuario: usuarioId })
            .populate('producto', 'nombre tipo tasaInteres moraPorcentaje descripcion')
            .populate('cuenta', 'numeroCuenta tipoCuenta saldo')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        return responderError(res, error, 'Error al obtener solicitudes de credito');
    }
};

export const getCreditRequests = async (req, res) => {
    try {
        const { estado } = req.query;
        const filter = {};
        if (estado) filter.estado = estado;

        const requests = await CreditRequest.find(filter)
            .populate('producto', 'nombre tipo tasaInteres moraPorcentaje descripcion')
            .populate('cuenta', 'numeroCuenta tipoCuenta saldo usuario')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        return responderError(res, error, 'Error al obtener solicitudes de credito');
    }
};

export const approveCreditRequest = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const adminId = obtenerUsuarioAutenticado(req);
        const {
            montoAprobado,
            tasaInteres,
            moraPorcentaje,
            comentarioAdmin,
        } = req.body;

        if (!adminId) {
            throw crearErrorHttp(401, 'No se pudo identificar al administrador autenticado');
        }

        session.startTransaction();

        const creditRequest = await CreditRequest.findOne({
            _id: req.params.id,
            estado: 'pendiente',
        })
            .populate('producto')
            .session(session);

        if (!creditRequest) {
            throw crearErrorHttp(404, 'Solicitud de credito pendiente no encontrada');
        }

        const account = await Account.findOne({
            _id: creditRequest.cuenta,
            usuario: creditRequest.usuario,
            estado: true,
        }).session(session);

        if (!account) {
            throw crearErrorHttp(404, 'Cuenta destino no encontrada o inactiva');
        }

        const montoFinal = obtenerNumeroValido(
            montoAprobado || creditRequest.montoSolicitado,
            'Monto aprobado',
            0.01
        );

        const tasaFinal = redondear(
            tasaInteres !== undefined
                ? tasaInteres
                : creditRequest.tasaInteresAplicada ?? creditRequest.producto?.tasaInteres ?? 0
        );
        const moraFinal = redondear(
            moraPorcentaje !== undefined
                ? moraPorcentaje
                : creditRequest.moraPorcentajeAplicada ?? creditRequest.producto?.moraPorcentaje ?? 5
        );

        if (creditRequest.producto) {
            validarMontoCredito({ product: creditRequest.producto, monto: montoFinal });
            validarPlazoCredito({
                product: creditRequest.producto,
                plazoMeses: creditRequest.plazoMeses,
            });
        }

        const cronograma = generarCronogramaCredito({
            monto: montoFinal,
            tasaInteres: tasaFinal,
            plazoMeses: creditRequest.plazoMeses,
        });

        const saldoAnterior = redondear(account.saldo);
        const saldoPosterior = redondear(saldoAnterior + montoFinal);

        account.saldo = saldoPosterior;
        await account.save({ session });

        const [transaction] = await Transaction.create(
            [
                {
                    tipo: 'credito',
                    monto: montoFinal,
                    descripcion: `Desembolso de credito aprobado: ${creditRequest.nombre}`,
                    cuentaOrigen: null,
                    cuentaDestino: account._id,
                    saldoAnteriorDestino: saldoAnterior,
                    saldoPosteriorDestino: saldoPosterior,
                    ejecutadaPor: adminId,
                },
            ],
            { session }
        );

        creditRequest.montoAprobado = montoFinal;
        creditRequest.tasaInteresAplicada = tasaFinal;
        creditRequest.moraPorcentajeAplicada = moraFinal;
        creditRequest.totalInteres = cronograma.totalInteres;
        creditRequest.totalEstimado = cronograma.totalEstimado;
        creditRequest.cuotaMensualEstimada = cronograma.cuotaMensualEstimada;
        creditRequest.cronogramaPagos = cronograma.cronogramaPagos;
        creditRequest.transaccionDesembolso = transaction._id;
        creditRequest.estado = 'aprobada';
        creditRequest.comentarioAdmin = comentarioAdmin || null;
        creditRequest.aprobadoPor = adminId;
        creditRequest.fechaAprobacion = new Date();

        await creditRequest.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: 'Credito aprobado y desembolsado correctamente',
            data: creditRequest,
            nuevoSaldo: account.saldo,
            transaccion: transaction,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        return responderError(res, error, 'Error al aprobar el credito');
    } finally {
        await session.endSession();
    }
};

export const rejectCreditRequest = async (req, res) => {
    try {
        const adminId = obtenerUsuarioAutenticado(req);
        const { comentarioAdmin } = req.body;

        if (!adminId) {
            throw crearErrorHttp(401, 'No se pudo identificar al administrador autenticado');
        }

        const creditRequest = await CreditRequest.findOneAndUpdate(
            { _id: req.params.id, estado: 'pendiente' },
            {
                $set: {
                    estado: 'rechazada',
                    comentarioAdmin: comentarioAdmin || null,
                    rechazadoPor: adminId,
                    fechaRechazo: new Date(),
                },
            },
            { new: true }
        );

        if (!creditRequest) {
            throw crearErrorHttp(404, 'Solicitud de credito pendiente no encontrada');
        }

        return res.status(200).json({
            success: true,
            message: 'Solicitud de credito rechazada correctamente',
            data: creditRequest,
        });
    } catch (error) {
        return responderError(res, error, 'Error al rechazar el credito');
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

        const creditRequest = await CreditRequest.findOne({
            _id: req.params.requestId || req.params.creditRequestId,
            usuario: usuarioId,
            estado: 'aprobada',
        }).session(session);

        if (!creditRequest) {
            throw crearErrorHttp(404, 'Credito no encontrado o no está activo');
        }

        const cuota = creditRequest.cronogramaPagos.id(req.params.paymentId);

        if (!cuota) {
            throw crearErrorHttp(404, 'Cuota no encontrada');
        }

        if (cuota.estado === 'pagada') {
            throw crearErrorHttp(400, 'Esta cuota ya fue pagada');
        }

        const account = await obtenerCuentaUsuario({ cuentaId, usuarioId, session });

        const fechaActual = new Date();
        const estaEnMora = fechaActual > new Date(cuota.fechaPago);
        const moraAplicada = estaEnMora
            ? redondear(cuota.montoCuota * ((creditRequest.moraPorcentajeAplicada || 0) / 100))
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
                    descripcion: `Pago de cuota ${cuota.numeroCuota} del credito ${creditRequest._id}`,
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
        creditRequest.transaccionesPago.push(transaction._id);

        const cuotasPendientes = creditRequest.cronogramaPagos.some(
            (item) => item.estado !== 'pagada'
        );

        if (!cuotasPendientes) {
            creditRequest.estado = 'finalizada';
        }

        await creditRequest.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: estaEnMora
                ? 'Cuota de credito pagada con mora aplicada'
                : 'Cuota de credito pagada correctamente',
            data: creditRequest,
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

        return responderError(res, error, 'Error al pagar la cuota del credito');
    } finally {
        await session.endSession();
    }
};