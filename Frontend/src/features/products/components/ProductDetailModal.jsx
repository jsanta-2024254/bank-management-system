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
                Number(product?.cuotasMaximas || 1) - Number(product?.cuotasMinimas || 1) + 1
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
    const numeroCuotas = Number(valoresFormulario?.numeroCuotas || product?.cuotasMinimas || 1)
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

    const interesTotal = esCredito ? montoCredito * (tasaCredito / 100) * (plazoMeses / 12) : 0
    const totalCredito = esCredito ? montoCredito + interesTotal : 0
    const cuotaMensualCredito = esCredito && plazoMeses > 0 ? totalCredito / plazoMeses : 0

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
            esCredito ? 'Enviando solicitud de crédito...' : 'Procesando adquisición...'
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
                    (esCredito ? 'Error al solicitar el crédito' : 'Error al adquirir el producto'),
                { id: toastId }
            )
        }
    }

    const inputClass =
        'w-full bg-zinc-950/70 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed'

    return (
        <Modal title={product.nombre || product.name} onClose={onClose}>
            <div className="space-y-8">
                <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        {product.tipo}
                    </span>

                    {descuento > 0 && !esCredito && (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <BadgePercent size={13} />
                            {descuento}% descuento app
                        </span>
                    )}
                </div>

                <div>
                    <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Info size={14} /> Descripción del producto
                    </h4>

                    <p className="text-white leading-relaxed">{product.descripcion}</p>
                </div>

                {esCredito && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                    Crédito mínimo
                                </p>
                                <p className="text-white font-black text-xl mt-1">
                                    {fmt(montoMinimoCredito)}
                                </p>
                            </div>

                            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                    Crédito máximo
                                </p>
                                <p className="text-white font-black text-xl mt-1">
                                    {fmt(montoMaximoCredito)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                            <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-2">
                                Condiciones visibles antes de solicitar
                            </p>
                            <p className="text-zinc-200 text-sm">
                                Puede solicitar desde <strong>{fmt(montoMinimoCredito)}</strong> hasta{' '}
                                <strong>{fmt(montoMaximoCredito)}</strong>.
                            </p>
                            <p className="text-zinc-400 text-xs mt-1">
                                Plazo permitido: {formatearPlazo(plazoMinimoCredito, plazoMaximoCredito)} · Tasa anual:{' '}
                                {tasaCredito}% · Mora: {moraCredito}% sobre cuota vencida.
                            </p>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-5 space-y-5"
                >
                    <div>
                        <h4 className="text-white font-bold flex items-center gap-2">
                            <ShoppingCart size={18} className="text-blue-400" />
                            {esCredito
                                ? 'Solicitar crédito'
                                : esSuscripcion
                                  ? 'Activar suscripción mensual'
                                  : 'Adquirir desde la app'}
                        </h4>

                        <p className="text-zinc-500 text-sm mt-1">
                            {esCredito
                                ? 'Esta solicitud queda pendiente. El dinero se acredita solo si un administrador la aprueba.'
                                : numeroCuotas > 1
                                  ? 'Se cobrará únicamente la primera cuota hoy y quedará registrado el cronograma de pagos.'
                                  : 'El monto será descontado de la cuenta seleccionada.'}
                        </p>
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Cuenta
                        </label>

                        <select
                            {...register('cuentaId', {
                                required: 'Debe seleccionar una cuenta',
                            })}
                            className={inputClass}
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
                            <p className="text-red-400 text-xs mt-1">
                                {errors.cuentaId.message}
                            </p>
                        )}
                    </div>

                    {esCredito ? (
                        <div className="space-y-5">
                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
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

                                <p className="text-zinc-500 text-xs mt-1.5 ml-1">
                                    Rango permitido: {fmt(montoMinimoCredito)} a {fmt(montoMaximoCredito)}.
                                </p>

                                {errors.monto && (
                                    <p className="text-red-400 text-xs mt-1">
                                        {errors.monto.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
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

                                <p className="text-zinc-500 text-xs mt-1.5 ml-1">
                                    Plazo permitido: {formatearPlazo(plazoMinimoCredito, plazoMaximoCredito)}.
                                </p>

                                {errors.plazoMeses && (
                                    <p className="text-red-400 text-xs mt-1">
                                        {errors.plazoMeses.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
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
                                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                    Número de cuotas
                                </label>

                                <select
                                    {...register('numeroCuotas')}
                                    className={inputClass}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                    Precio base
                                </p>
                                <p className="text-white font-black text-xl">{fmt(precioBase)}</p>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                    Descuento app
                                </p>
                                <p className="text-emerald-400 font-black text-xl">
                                    -{fmt(descuentoAplicado)}
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 sm:col-span-2">
                                <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">
                                    {numeroCuotas > 1 ? 'A pagar hoy' : 'Total a pagar hoy'}
                                </p>
                                <p className="text-white font-black text-2xl">
                                    {fmt(cuotaInicial)}
                                </p>
                                {numeroCuotas > 1 && (
                                    <p className="text-zinc-400 text-xs mt-1">
                                        Total con descuento: {fmt(totalProducto)} en {numeroCuotas} cuotas.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {cronogramaProducto.length > 1 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                            <h5 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
                                <CalendarDays size={16} className="text-blue-400" />
                                Cronograma estimado de cuotas
                            </h5>

                            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                                {cronogramaProducto.map((cuota) => (
                                    <div
                                        key={cuota.numeroCuota}
                                        className="flex justify-between text-xs border border-zinc-800 rounded-xl px-3 py-2"
                                    >
                                        <span className="text-zinc-400">
                                            Cuota {cuota.numeroCuota} - {fmtFecha(cuota.fechaPago)}
                                        </span>

                                        <span className="text-white font-bold">
                                            {fmt(cuota.montoCuota)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {esCredito && (
                        <div className="space-y-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                                    Condiciones estimadas del crédito
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Monto a solicitar: <strong>{fmt(montoCredito)}</strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Rango disponible:{' '}
                                    <strong>
                                        {fmt(montoMinimoCredito)} a {fmt(montoMaximoCredito)}
                                    </strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Plazo seleccionado: <strong>{plazoMeses} meses</strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Tasa anual: <strong>{tasaCredito}%</strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Mora por incumplimiento:{' '}
                                    <strong>{moraCredito}% sobre la cuota vencida</strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Total estimado a pagar:{' '}
                                    <strong>{fmt(totalCredito)}</strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Cuota mensual estimada:{' '}
                                    <strong>{fmt(cuotaMensualCredito)}</strong>
                                </p>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                <h5 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
                                    <CalendarDays size={16} className="text-blue-400" />
                                    Fechas estimadas de pago
                                </h5>

                                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                                    {cronogramaCredito.map((cuota) => (
                                        <div
                                            key={cuota.numeroCuota}
                                            className="flex justify-between text-xs border border-zinc-800 rounded-xl px-3 py-2"
                                        >
                                            <span className="text-zinc-400">
                                                Cuota {cuota.numeroCuota} - {fmtFecha(cuota.fechaPago)}
                                            </span>

                                            <span className="text-white font-bold">
                                                {fmt(cuota.montoCuota)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {esSuscripcion && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                                Suscripción mensual
                            </p>

                            <p className="text-zinc-300 text-sm">
                                Primer cobro hoy: <strong>{fmt(totalProducto)}</strong>
                            </p>

                            <p className="text-zinc-300 text-sm">
                                Próximo cobro estimado:{' '}
                                <strong>{fmtFecha(agregarMeses(new Date(), 1))}</strong>
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || accounts.length === 0}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    <div className="flex items-center gap-3 text-zinc-300 text-sm">
                        <CheckCircle2 size={16} className="text-blue-500" />
                        {esCredito
                            ? 'El desembolso se realiza únicamente si la solicitud es aprobada.'
                            : 'La operación queda registrada en el historial financiero.'}
                    </div>

                    {esCredito && (
                        <div className="flex items-center gap-3 text-zinc-300 text-sm">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            El monto solicitado debe estar dentro del mínimo y máximo configurado por el administrador.
                        </div>
                    )}

                    {!esCredito && descuento > 0 && (
                        <div className="flex items-center gap-3 text-zinc-300 text-sm">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            Los descuentos aplican únicamente al adquirir desde la app.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default ProductDetailModal