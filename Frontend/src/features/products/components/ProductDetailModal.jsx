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

const ProductDetailModal = ({ product, onClose }) => {
    const { accounts, fetchAccounts } = useAccountStore()
    const { acquireProduct, loading } = useProductStore()

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            cuentaId: '',
            monto: product?.tipo === 'credito' ? '' : product?.precio || '',
            plazoMeses: product?.plazoMesesMinimo || 12,
        },
    })

    const valoresFormulario = useWatch({ control })

    const montoFormulario = valoresFormulario?.monto
    const plazoMesesFormulario = valoresFormulario?.plazoMeses

    useEffect(() => {
        fetchAccounts()
    }, [fetchAccounts])

    if (!product) return null

    const tipo = String(product.tipo || '').toLowerCase()
    const esCredito = tipo === 'credito'
    const esSuscripcion = tipo === 'suscripcion'
    const requiereMontoManual =
        tipo === 'credito' || tipo === 'ahorro' || tipo === 'inversion'

    const monto = Number(montoFormulario || product.precio || 0)
    const plazoMeses = Number(
        plazoMesesFormulario || product.plazoMesesMinimo || 1
    )
    const descuento = Number(product.descuentoAppPorcentaje || 0)
    const precioBase = monto
    const descuentoAplicado = esCredito ? 0 : precioBase * (descuento / 100)
    const montoFinal = esCredito ? monto : precioBase - descuentoAplicado

    const tasa = Number(product.tasaInteres || 0)
    const mora = Number(product.moraPorcentaje || 0)
    const interesTotal = esCredito ? monto * (tasa / 100) * (plazoMeses / 12) : 0
    const totalCredito = esCredito ? monto + interesTotal : montoFinal
    const cuotaMensual =
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

    const cronograma = esCredito
        ? Array.from({ length: plazoMeses }, (_, index) => ({
              numeroCuota: index + 1,
              fechaPago: agregarMeses(new Date(), index + 1),
              montoCuota: cuotaMensual,
          }))
        : []

    const onSubmit = async (data) => {
        const toastId = toast.loading(
            esCredito
                ? 'Procesando crédito...'
                : esSuscripcion
                  ? 'Activando suscripción...'
                  : 'Procesando adquisición...'
        )

        try {
            await acquireProduct(product._id || product.id, {
                cuentaId: data.cuentaId,
                monto: requiereMontoManual
                    ? Number(data.monto)
                    : Number(product.precio),
                plazoMeses: Number(
                    data.plazoMeses || product.plazoMesesMinimo || 1
                ),
            })

            await fetchAccounts()
            reset({
                cuentaId: '',
                monto: product?.tipo === 'credito' ? '' : product?.precio || '',
                plazoMeses: product?.plazoMesesMinimo || 12,
            })

            toast.success(
                esCredito
                    ? 'Crédito acreditado correctamente'
                    : esSuscripcion
                      ? 'Suscripción activada correctamente'
                      : 'Producto adquirido correctamente',
                { id: toastId }
            )

            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al adquirir el producto',
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

                    <p className="text-white leading-relaxed">
                        {product.descripcion}
                    </p>
                </div>

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
                                ? 'El monto será acreditado a tu cuenta y se generará un cronograma de pagos.'
                                : esSuscripcion
                                  ? 'Se cobrará el primer mes ahora y quedará registrada la próxima fecha de cobro.'
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
                                    {account.numeroCuenta} - {account.tipoCuenta} -{' '}
                                    {fmt(account.saldo)}
                                </option>
                            ))}
                        </select>

                        {errors.cuentaId && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.cuentaId.message}
                            </p>
                        )}
                    </div>

                    {requiereMontoManual && (
                        <div>
                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                {esCredito ? 'Monto solicitado' : 'Monto a invertir'}
                            </label>

                            <input
                                {...register('monto', {
                                    required: 'El monto es requerido',
                                    min: {
                                        value: 0.01,
                                        message: 'El monto debe ser mayor que 0',
                                    },
                                })}
                                type="number"
                                step="0.01"
                                className={inputClass}
                                placeholder="0.00"
                                disabled={isLoading}
                            />

                            {errors.monto && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.monto.message}
                                </p>
                            )}
                        </div>
                    )}

                    {esCredito && (
                        <div>
                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                                Plazo en meses
                            </label>

                            <input
                                {...register('plazoMeses', {
                                    required: 'El plazo es requerido',
                                    min: {
                                        value: product.plazoMesesMinimo || 1,
                                        message: `El plazo mínimo es ${
                                            product.plazoMesesMinimo || 1
                                        }`,
                                    },
                                    max: {
                                        value: product.plazoMesesMaximo || 60,
                                        message: `El plazo máximo es ${
                                            product.plazoMesesMaximo || 60
                                        }`,
                                    },
                                })}
                                type="number"
                                step="1"
                                className={inputClass}
                                disabled={isLoading}
                            />

                            {errors.plazoMeses && (
                                <p className="text-red-400 text-xs mt-1">
                                    {errors.plazoMeses.message}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                Monto base
                            </p>
                            <p className="text-white font-black text-xl">
                                {fmt(precioBase)}
                            </p>
                        </div>

                        {!esCredito && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                    Descuento app
                                </p>
                                <p className="text-emerald-400 font-black text-xl">
                                    -{fmt(descuentoAplicado)}
                                </p>
                            </div>
                        )}

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 sm:col-span-2">
                            <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">
                                Total {esCredito ? 'a desembolsar' : 'a pagar hoy'}
                            </p>
                            <p className="text-white font-black text-2xl">
                                {fmt(esCredito ? monto : montoFinal)}
                            </p>
                        </div>
                    </div>

                    {esCredito && (
                        <div className="space-y-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                                    Condiciones del crédito
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Tasa anual: <strong>{tasa}%</strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Mora por incumplimiento:{' '}
                                    <strong>{mora}% sobre la cuota vencida</strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Total estimado a pagar:{' '}
                                    <strong>{fmt(totalCredito)}</strong>
                                </p>

                                <p className="text-zinc-300 text-sm">
                                    Cuota mensual estimada:{' '}
                                    <strong>{fmt(cuotaMensual)}</strong>
                                </p>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                <h5 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
                                    <CalendarDays
                                        size={16}
                                        className="text-blue-400"
                                    />
                                    Fechas estimadas de pago
                                </h5>

                                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                                    {cronograma.map((cuota) => (
                                        <div
                                            key={cuota.numeroCuota}
                                            className="flex justify-between text-xs border border-zinc-800 rounded-xl px-3 py-2"
                                        >
                                            <span className="text-zinc-400">
                                                Cuota {cuota.numeroCuota} -{' '}
                                                {fmtFecha(cuota.fechaPago)}
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
                                Primer cobro hoy: <strong>{fmt(montoFinal)}</strong>
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
                              ? 'Aceptar crédito'
                              : esSuscripcion
                                ? 'Activar suscripción'
                                : 'Adquirir producto'}
                    </button>
                </form>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-zinc-300 text-sm">
                        <CheckCircle2 size={16} className="text-blue-500" />
                        Operación registrada en el historial financiero.
                    </div>

                    <div className="flex items-center gap-3 text-zinc-300 text-sm">
                        <CheckCircle2 size={16} className="text-blue-500" />
                        Los descuentos aplican únicamente al adquirir desde la app.
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ProductDetailModal