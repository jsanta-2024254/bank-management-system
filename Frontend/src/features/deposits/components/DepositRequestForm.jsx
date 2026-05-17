import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Banknote, FileText, Landmark, Send } from 'lucide-react'
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
        if (estado === 'aprobada') return 'bg-emerald-500/10 text-emerald-400'
        if (estado === 'rechazada') return 'bg-red-500/10 text-red-400'
        return 'bg-amber-500/10 text-amber-400'
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
        'w-full bg-zinc-950 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed'

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">
                    Solicitar depósito
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Registra un depósito en efectivo o cheque para que administración lo valide.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6"
                >
                    <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-5 flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Landmark className="text-blue-400" size={22} />
                        </div>

                        <div>
                            <h2 className="text-white font-bold text-lg">
                                Depósito sujeto a aprobación
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">
                                El saldo no cambiará hasta que un administrador apruebe la solicitud.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Cuenta destino
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

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Tipo de depósito
                        </label>

                        <select
                            {...register('tipoDeposito', {
                                required: 'Debe seleccionar el tipo de depósito',
                            })}
                            className={inputClass}
                            disabled={isLoading}
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="cheque">Cheque</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Monto
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

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
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
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        {isLoading ? 'Enviando...' : 'Enviar solicitud'}
                    </button>
                </form>

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-5">
                        <FileText size={20} className="text-blue-400" />
                        Mis solicitudes
                    </h2>

                    <div className="space-y-3">
                        {myDepositRequests.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-3xl">
                                <Banknote className="mx-auto text-zinc-700 mb-3" size={36} />
                                <p className="text-zinc-500 text-sm">
                                    Aún no tienes solicitudes de depósito.
                                </p>
                            </div>
                        ) : (
                            myDepositRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <p className="text-white font-bold">
                                                {fmt(request.monto)}
                                            </p>
                                            <p className="text-zinc-500 text-xs capitalize">
                                                {request.tipoDeposito}
                                            </p>
                                        </div>

                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getEstadoClass(request.estado)}`}
                                        >
                                            {request.estado}
                                        </span>
                                    </div>

                                    <p className="text-zinc-400 text-xs">
                                        Cuenta:{' '}
                                        {request.cuenta?.numeroCuenta || 'No disponible'}
                                    </p>

                                    {request.referencia && (
                                        <p className="text-zinc-500 text-xs mt-1">
                                            Ref: {request.referencia}
                                        </p>
                                    )}

                                    {request.motivoRechazo && (
                                        <p className="text-red-400 text-xs mt-2">
                                            Motivo: {request.motivoRechazo}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DepositRequestForm