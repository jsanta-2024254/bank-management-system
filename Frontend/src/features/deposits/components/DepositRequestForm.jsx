import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    Banknote,
    FileText,
    Landmark,
    Send,
    CreditCard,
    DollarSign,
    ClipboardCheck,
    MessageSquare,
    Hash,
} from 'lucide-react'
import useAccountStore from '../../accounts/store/accountStore'
import useDepositStore from '../store/depositStore'

const DepositRequestForm = () => {
    const { accounts, fetchAccounts } = useAccountStore()
    const {
        myDepositRequests,
        fetchMyDepositRequests,
        createDepositRequest,
        loading,
    } = useDepositStore()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            cuentaId: '',
            tipoDeposito: 'efectivo',
            monto: '',
            referencia: '',
            comentarioUsuario: '',
        },
    })

    useEffect(() => {
        fetchAccounts()
        fetchMyDepositRequests()
    }, [fetchAccounts, fetchMyDepositRequests])

    const fmt = (value) =>
        new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ',
        }).format(value || 0)

    const getEstadoClass = (estado) => {
        if (estado === 'aprobada') {
            return 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }

        if (estado === 'rechazada') {
            return 'border-red-200 bg-red-50 text-red-700'
        }

        return 'border-amber-200 bg-amber-50 text-amber-700'
    }

    const onSubmit = async (data) => {
        const toastId = toast.loading('Enviando solicitud de depósito...')

        try {
            await createDepositRequest({
                cuentaId: data.cuentaId,
                tipoDeposito: data.tipoDeposito,
                monto: Number(data.monto),
                referencia: data.referencia,
                comentarioUsuario: data.comentarioUsuario,
            })

            reset({
                cuentaId: '',
                tipoDeposito: 'efectivo',
                monto: '',
                referencia: '',
                comentarioUsuario: '',
            })

            toast.success('Solicitud enviada correctamente', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'Error al enviar la solicitud de depósito',
                { id: toastId }
            )
        }
    }

    const isLoading = loading || isSubmitting

    const inputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-6xl pb-10"
        >
            <div className="mb-8 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                <div className="premium-gold-line mb-6 h-px w-full" />

                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                        <Banknote size={28} className="text-[#5b3a0d]" />
                    </div>

                    <div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                            Depósitos de cliente
                        </p>

                        <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                            Solicitar Depósito
                        </h1>

                        <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                            Registra un depósito en efectivo o cheque para validación administrativa.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="relative overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 p-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:p-8"
                >
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <div className="mb-6 rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                        <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                                <Landmark size={22} />
                            </div>

                            <div>
                                <h2 className="text-lg font-black text-[#3f2c12]">
                                    Depósito sujeto a aprobación
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                                    El saldo no cambiará hasta que un administrador apruebe la solicitud.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>
                                <CreditCard size={11} />
                                Cuenta destino
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
                                <p className={errorClass}>
                                    {errors.cuentaId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                <ClipboardCheck size={11} />
                                Tipo de depósito
                            </label>

                            <select
                                {...register('tipoDeposito', {
                                    required: 'Debe seleccionar el tipo de depósito',
                                })}
                                className={`${inputClass} appearance-none`}
                                disabled={isLoading}
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>
                                <DollarSign size={11} />
                                Monto
                            </label>

                            <div className="relative">
                                <DollarSign
                                    size={14}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                                />

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
                                    className={`${inputClass} pl-10`}
                                    placeholder="0.00"
                                    disabled={isLoading}
                                />
                            </div>

                            {errors.monto && (
                                <p className={errorClass}>
                                    {errors.monto.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                <Hash size={11} />
                                Referencia / boleta / cheque
                            </label>

                            <input
                                {...register('referencia')}
                                className={inputClass}
                                placeholder="Ejemplo: boleta 000123 o cheque 4567"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <MessageSquare size={11} />
                                Comentario opcional
                            </label>

                            <textarea
                                {...register('comentarioUsuario')}
                                rows={3}
                                className={`${inputClass} resize-none`}
                                placeholder="Comentario adicional para administración"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || accounts.length === 0}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                        >
                            <Send size={18} />
                            {isLoading ? 'Enviando...' : 'Enviar solicitud'}
                        </button>
                    </div>
                </form>

                <div className="relative overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 p-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl">
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-[#3f2c12]">
                        <FileText size={20} className="text-[#8a611b]" />
                        Mis solicitudes
                    </h2>

                    <div className="space-y-3">
                        {myDepositRequests.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-[#d7bc73]/45 bg-white/30 py-10 text-center">
                                <Banknote
                                    className="mx-auto mb-3 text-[#9a6b16]/45"
                                    size={36}
                                />

                                <p className="text-sm font-semibold text-[#8a6a3a]">
                                    Aún no tienes solicitudes de depósito.
                                </p>
                            </div>
                        ) : (
                            myDepositRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4 shadow-[0_12px_28px_rgba(92,64,19,0.08)]"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-black text-[#3f2c12]">
                                                {fmt(request.monto)}
                                            </p>

                                            <p className="mt-0.5 text-xs font-black uppercase tracking-[0.18em] text-[#8a611b]/70">
                                                {request.tipoDeposito}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getEstadoClass(request.estado)}`}
                                        >
                                            {request.estado}
                                        </span>
                                    </div>

                                    <p className="font-mono text-xs font-semibold text-[#7a6849]">
                                        Cuenta:{' '}
                                        {request.cuenta?.numeroCuenta || 'No disponible'}
                                    </p>

                                    {request.referencia && (
                                        <p className="mt-1 text-xs font-semibold text-[#8a6a3a]">
                                            Ref: {request.referencia}
                                        </p>
                                    )}

                                    {request.motivoRechazo && (
                                        <p className="mt-3 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-xs font-semibold text-red-700">
                                            Motivo: {request.motivoRechazo}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default DepositRequestForm