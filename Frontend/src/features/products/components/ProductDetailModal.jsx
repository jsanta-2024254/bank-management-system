import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import Modal from '../../../shared/components/ui/Modal'
import {
    CheckCircle2,
    Info,
    ShoppingCart,
    CreditCard,
    CalendarDays,
    BadgePercent,
    BadgeDollarSign,
    DollarSign,
    MessageSquare,
    Percent,
    Landmark,
} from 'lucide-react'
import useAccountStore from '../../accounts/store/accountStore'
import useProductStore from '../store/productStore'

const normalizarTexto = (valor) =>
    String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

const ProductDetailModal = ({ product, onClose }) => {
    const { accounts, fetchAccounts } = useAccountStore()
    const { acquireProduct, requestCreditOpportunity, loading } = useProductStore()

    const tipoProducto = normalizarTexto(product?.tipo || product?.type)
    const esCredito = tipoProducto === 'credito'
    const montoMinimoCredito = Number(product?.montoMinimo || 0)
    const montoMaximoCredito = Number(product?.montoMaximo || 0)
    const plazoMinimoCredito = Number(product?.plazoMesesMinimo || 1)
    const plazoMaximoCredito = Number(product?.plazoMesesMaximo || 60)
    const tasaCredito = Number(product?.tasaInteres || 0)
    const moraCredito = Number(product?.moraPorcentaje || 0)

    const cuotasDisponibles = Array.from(
        {
            length: Math.max(
                1,
                Number(product?.cuotasMaximas || 1) -
                Number(product?.cuotasMinimas || 1) +
                1
            ),
        },
        (_, index) => Number(product?.cuotasMinimas || 1) + index
    )

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            cuentaId: '',
            monto: esCredito ? montoMinimoCredito || '' : '',
            plazoMeses: esCredito ? plazoMinimoCredito : '',
            numeroCuotas: product?.cuotasMinimas || 1,
            comentarioCliente: '',
        },
    })

    const valoresFormulario = useWatch({ control })
    const numeroCuotas = Number(
        valoresFormulario?.numeroCuotas || product?.cuotasMinimas || 1
    )
    const montoCredito = Number(valoresFormulario?.monto || 0)
    const plazoMeses = Number(valoresFormulario?.plazoMeses || plazoMinimoCredito)

    useEffect(() => {
        fetchAccounts()
    }, [fetchAccounts])

    if (!product) return null

    const tipo = normalizarTexto(product.tipo || product.type)
    const esSuscripcion = tipo === 'suscripcion'
    const permitePagoCuotas = product.permitePagoCuotas && !esSuscripcion

    const precioBase = Number(product.precio || 0)
    const descuento = Number(product.descuentoAppPorcentaje || 0)
    const descuentoAplicado = esCredito ? 0 : precioBase * (descuento / 100)
    const totalProducto = esCredito ? 0 : precioBase - descuentoAplicado
    const cuotaInicial = numeroCuotas > 1 ? totalProducto / numeroCuotas : totalProducto

    const interesTotal = esCredito
        ? montoCredito * (tasaCredito / 100) * (plazoMeses / 12)
        : 0
    const totalCredito = esCredito ? montoCredito + interesTotal : 0
    const cuotaMensualCredito =
        esCredito && plazoMeses > 0 ? totalCredito / plazoMeses : 0

    const isLoading = loading || isSubmitting

    const fmt = (value) =>
        new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ',
        }).format(Number(value || 0))

    const agregarMeses = (fechaBase, meses) => {
        const fecha = new Date(fechaBase)
        fecha.setMonth(fecha.getMonth() + meses)
        return fecha
    }

    const fmtFecha = (fecha) =>
        new Intl.DateTimeFormat('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(fecha)

    const formatearPlazo = (minimo, maximo) => {
        if (minimo && maximo && minimo !== maximo) return `${minimo} a ${maximo} meses`
        return `${minimo || maximo} meses`
    }

    const cronogramaProducto =
        !esCredito && numeroCuotas > 1
            ? Array.from({ length: numeroCuotas }, (_, index) => ({
                numeroCuota: index + 1,
                fechaPago: agregarMeses(new Date(), index),
                montoCuota: totalProducto / numeroCuotas,
            }))
            : []

    const cronogramaCredito = esCredito
        ? Array.from({ length: plazoMeses }, (_, index) => ({
            numeroCuota: index + 1,
            fechaPago: agregarMeses(new Date(), index + 1),
            montoCuota: cuotaMensualCredito,
        }))
        : []

    const onSubmit = async (data) => {
        const toastId = toast.loading(
            esCredito
                ? 'Enviando solicitud de crédito...'
                : 'Procesando adquisición...'
        )

        try {
            if (esCredito) {
                await requestCreditOpportunity(product._id || product.id, {
                    cuentaId: data.cuentaId,
                    montoSolicitado: Number(data.monto),
                    plazoMeses: Number(data.plazoMeses),
                    comentarioCliente: data.comentarioCliente?.trim() || '',
                })

                toast.success('Solicitud enviada para aprobación administrativa', {
                    id: toastId,
                })
            } else {
                await acquireProduct(product._id || product.id, {
                    cuentaId: data.cuentaId,
                    numeroCuotas: Number(data.numeroCuotas || 1),
                })

                await fetchAccounts()

                toast.success(
                    Number(data.numeroCuotas || 1) > 1
                        ? 'Producto adquirido en cuotas correctamente'
                        : esSuscripcion
                            ? 'Suscripción activada correctamente'
                            : 'Producto adquirido correctamente',
                    { id: toastId }
                )
            }

            reset({
                cuentaId: '',
                monto: esCredito ? montoMinimoCredito || '' : '',
                plazoMeses: esCredito ? plazoMinimoCredito : '',
                numeroCuotas: product?.cuotasMinimas || 1,
                comentarioCliente: '',
            })

            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                (esCredito
                    ? 'Error al solicitar el crédito'
                    : 'Error al adquirir el producto'),
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    return (
        <Modal title={product.nombre || product.name} onClose={onClose}>
            <div className="space-y-7">
                <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-[#d7bc73]/50 bg-[#fff8df] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#8a611b]">
                        {product.tipo}
                    </span>

                    {descuento > 0 && !esCredito && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                            <BadgePercent size={13} />
                            {descuento}% descuento app
                        </span>
                    )}
                </div>

                <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                    <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75">
                        <Info size={14} />
                        Descripción del producto
                    </h4>

                    <p className="text-sm leading-7 text-[#3f2c12]">
                        {product.descripcion}
                    </p>
                </div>

                {esCredito && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                    Crédito mínimo
                                </p>

                                <p className="mt-1 text-xl font-black text-[#3f2c12]">
                                    {fmt(montoMinimoCredito)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                    Crédito máximo
                                </p>

                                <p className="mt-1 text-xl font-black text-[#3f2c12]">
                                    {fmt(montoMaximoCredito)}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df]/65 p-4">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                Condiciones visibles antes de solicitar
                            </p>

                            <p className="text-sm leading-6 text-[#7a6849]">
                                Puede solicitar desde{' '}
                                <span className="font-black text-[#3f2c12]">
                                    {fmt(montoMinimoCredito)}
                                </span>{' '}
                                hasta{' '}
                                <span className="font-black text-[#3f2c12]">
                                    {fmt(montoMaximoCredito)}
                                </span>
                                .
                            </p>

                            <p className="mt-1 text-xs font-semibold text-[#8a6a3a]">
                                Plazo permitido: {formatearPlazo(plazoMinimoCredito, plazoMaximoCredito)} · Tasa anual:{' '}
                                {tasaCredito}% · Mora: {moraCredito}% sobre cuota vencida.
                            </p>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5 rounded-3xl border border-[#d7bc73]/45 bg-white/38 p-5"
                >
                    <div>
                        <h4 className="flex items-center gap-2 text-base font-black text-[#3f2c12]">
                            <ShoppingCart size={18} className="text-[#8a611b]" />
                            {esCredito
                                ? 'Solicitar crédito'
                                : esSuscripcion
                                    ? 'Activar suscripción mensual'
                                    : 'Adquirir desde la app'}
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                            {esCredito
                                ? 'Esta solicitud queda pendiente. El dinero se acredita solo si un administrador la aprueba.'
                                : numeroCuotas > 1
                                    ? 'Se cobrará únicamente la primera cuota hoy y quedará registrado el cronograma de pagos.'
                                    : 'El monto será descontado de la cuenta seleccionada.'}
                        </p>
                    </div>

                    <div>
                        <label className={labelClass}>
                            <Landmark size={11} />
                            Cuenta
                        </label>

                        <select
                            {...register('cuentaId', {
                                required: 'Debe seleccionar una cuenta',
                            })}
                            className={`${inputClass} appearance-none`}
                            disabled={isLoading}
                        >
                            <option value="">Seleccione una cuenta</option>

                            {accounts.map((account) => (
                                <option
                                    key={account._id || account.id}
                                    value={account._id || account.id}
                                >
                                    {account.numeroCuenta} - {account.tipoCuenta} - {fmt(account.saldo)}
                                </option>
                            ))}
                        </select>

                        {errors.cuentaId && (
                            <p className={errorClass}>{errors.cuentaId.message}</p>
                        )}
                    </div>

                    {esCredito ? (
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>
                                    <DollarSign size={11} />
                                    Monto solicitado
                                </label>

                                <input
                                    {...register('monto', {
                                        required: 'El monto es requerido',
                                        min: {
                                            value: montoMinimoCredito || 0.01,
                                            message: `El monto mínimo es ${fmt(montoMinimoCredito)}`,
                                        },
                                        max: {
                                            value: montoMaximoCredito || 999999999,
                                            message: `El monto máximo es ${fmt(montoMaximoCredito)}`,
                                        },
                                    })}
                                    type="number"
                                    min={montoMinimoCredito || 0.01}
                                    max={montoMaximoCredito || undefined}
                                    step="0.01"
                                    className={inputClass}
                                    placeholder="0.00"
                                    disabled={isLoading}
                                />

                                <p className="mt-1.5 ml-1 text-xs font-semibold text-[#8a6a3a]">
                                    Rango permitido: {fmt(montoMinimoCredito)} a {fmt(montoMaximoCredito)}.
                                </p>

                                {errors.monto && (
                                    <p className={errorClass}>{errors.monto.message}</p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <CalendarDays size={11} />
                                    Plazo en meses
                                </label>

                                <input
                                    {...register('plazoMeses', {
                                        required: 'El plazo es requerido',
                                        min: {
                                            value: plazoMinimoCredito,
                                            message: `El plazo mínimo es ${plazoMinimoCredito}`,
                                        },
                                        max: {
                                            value: plazoMaximoCredito,
                                            message: `El plazo máximo es ${plazoMaximoCredito}`,
                                        },
                                    })}
                                    type="number"
                                    min={plazoMinimoCredito}
                                    max={plazoMaximoCredito}
                                    step="1"
                                    className={inputClass}
                                    disabled={isLoading}
                                />

                                <p className="mt-1.5 ml-1 text-xs font-semibold text-[#8a6a3a]">
                                    Plazo permitido: {formatearPlazo(plazoMinimoCredito, plazoMaximoCredito)}.
                                </p>

                                {errors.plazoMeses && (
                                    <p className={errorClass}>{errors.plazoMeses.message}</p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <MessageSquare size={11} />
                                    Comentario para el banco
                                </label>

                                <textarea
                                    {...register('comentarioCliente')}
                                    className={`${inputClass} resize-none`}
                                    rows={3}
                                    placeholder="Opcional"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    ) : (
                        permitePagoCuotas && (
                            <div>
                                <label className={labelClass}>
                                    <CreditCard size={11} />
                                    Número de cuotas
                                </label>

                                <select
                                    {...register('numeroCuotas')}
                                    className={`${inputClass} appearance-none`}
                                    disabled={isLoading}
                                >
                                    {cuotasDisponibles.map((cuota) => (
                                        <option key={cuota} value={cuota}>
                                            {cuota} {cuota === 1 ? 'cuota' : 'cuotas'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )
                    )}

                    {!esCredito && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                    Precio base
                                </p>

                                <p className="mt-1 text-xl font-black text-[#3f2c12]">
                                    {fmt(precioBase)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/85 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                                    Descuento app
                                </p>

                                <p className="mt-1 text-xl font-black text-emerald-700">
                                    -{fmt(descuentoAplicado)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df]/65 p-4 sm:col-span-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                    {numeroCuotas > 1 ? 'A pagar hoy' : 'Total a pagar hoy'}
                                </p>

                                <p className="mt-1 text-2xl font-black text-[#3f2c12]">
                                    {fmt(cuotaInicial)}
                                </p>

                                {numeroCuotas > 1 && (
                                    <p className="mt-1 text-xs font-semibold text-[#8a6a3a]">
                                        Total con descuento: {fmt(totalProducto)} en {numeroCuotas} cuotas.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {cronogramaProducto.length > 1 && (
                        <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4">
                            <h5 className="mb-3 flex items-center gap-2 text-sm font-black text-[#3f2c12]">
                                <CalendarDays size={16} className="text-[#8a611b]" />
                                Cronograma estimado de cuotas
                            </h5>

                            <div className="custom-scrollbar max-h-52 space-y-2 overflow-y-auto pr-1">
                                {cronogramaProducto.map((cuota) => (
                                    <div
                                        key={cuota.numeroCuota}
                                        className="flex justify-between rounded-xl border border-[#d7bc73]/35 bg-white/35 px-3 py-2 text-xs"
                                    >
                                        <span className="font-semibold text-[#8a6a3a]">
                                            Cuota {cuota.numeroCuota} - {fmtFecha(cuota.fechaPago)}
                                        </span>

                                        <span className="font-black text-[#3f2c12]">
                                            {fmt(cuota.montoCuota)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {esCredito && (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4">
                                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                    Condiciones estimadas del crédito
                                </p>

                                <div className="space-y-1 text-sm text-[#7a6849]">
                                    <p>
                                        Monto a solicitar:{' '}
                                        <span className="font-black text-[#3f2c12]">
                                            {fmt(montoCredito)}
                                        </span>
                                    </p>

                                    <p>
                                        Rango disponible:{' '}
                                        <span className="font-black text-[#3f2c12]">
                                            {fmt(montoMinimoCredito)} a {fmt(montoMaximoCredito)}
                                        </span>
                                    </p>

                                    <p>
                                        Plazo seleccionado:{' '}
                                        <span className="font-black text-[#3f2c12]">
                                            {plazoMeses} meses
                                        </span>
                                    </p>

                                    <p>
                                        Tasa anual:{' '}
                                        <span className="font-black text-[#3f2c12]">
                                            {tasaCredito}%
                                        </span>
                                    </p>

                                    <p>
                                        Mora por incumplimiento:{' '}
                                        <span className="font-black text-[#3f2c12]">
                                            {moraCredito}% sobre la cuota vencida
                                        </span>
                                    </p>

                                    <p>
                                        Total estimado a pagar:{' '}
                                        <span className="font-black text-[#3f2c12]">
                                            {fmt(totalCredito)}
                                        </span>
                                    </p>

                                    <p>
                                        Cuota mensual estimada:{' '}
                                        <span className="font-black text-[#3f2c12]">
                                            {fmt(cuotaMensualCredito)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4">
                                <h5 className="mb-3 flex items-center gap-2 text-sm font-black text-[#3f2c12]">
                                    <CalendarDays size={16} className="text-[#8a611b]" />
                                    Fechas estimadas de pago
                                </h5>

                                <div className="custom-scrollbar max-h-52 space-y-2 overflow-y-auto pr-1">
                                    {cronogramaCredito.map((cuota) => (
                                        <div
                                            key={cuota.numeroCuota}
                                            className="flex justify-between rounded-xl border border-[#d7bc73]/35 bg-white/35 px-3 py-2 text-xs"
                                        >
                                            <span className="font-semibold text-[#8a6a3a]">
                                                Cuota {cuota.numeroCuota} - {fmtFecha(cuota.fechaPago)}
                                            </span>

                                            <span className="font-black text-[#3f2c12]">
                                                {fmt(cuota.montoCuota)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {esSuscripcion && (
                        <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                Suscripción mensual
                            </p>

                            <p className="text-sm text-[#7a6849]">
                                Primer cobro hoy:{' '}
                                <span className="font-black text-[#3f2c12]">
                                    {fmt(totalProducto)}
                                </span>
                            </p>

                            <p className="text-sm text-[#7a6849]">
                                Próximo cobro estimado:{' '}
                                <span className="font-black text-[#3f2c12]">
                                    {fmtFecha(agregarMeses(new Date(), 1))}
                                </span>
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || accounts.length === 0}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/50 bg-gradient-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                    >
                        <CreditCard size={18} />

                        {isLoading
                            ? 'Procesando...'
                            : esCredito
                                ? 'Enviar solicitud'
                                : numeroCuotas > 1
                                    ? 'Pagar primera cuota'
                                    : esSuscripcion
                                        ? 'Activar suscripción'
                                        : 'Adquirir producto'}
                    </button>
                </form>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-semibold text-[#7a6849]">
                        <CheckCircle2 size={16} className="text-[#8a611b]" />
                        {esCredito
                            ? 'El desembolso se realiza únicamente si la solicitud es aprobada.'
                            : 'La operación queda registrada en el historial financiero.'}
                    </div>

                    {esCredito && (
                        <div className="flex items-center gap-3 text-sm font-semibold text-[#7a6849]">
                            <CheckCircle2 size={16} className="text-[#8a611b]" />
                            El monto solicitado debe estar dentro del mínimo y máximo configurado por el administrador.
                        </div>
                    )}

                    {!esCredito && descuento > 0 && (
                        <div className="flex items-center gap-3 text-sm font-semibold text-[#7a6849]">
                            <CheckCircle2 size={16} className="text-[#8a611b]" />
                            Los descuentos aplican únicamente al adquirir desde la app.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default ProductDetailModal