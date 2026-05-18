import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    CheckCircle2,
    Clock,
    XCircle,
    Banknote,
    RefreshCw,
    CreditCard,
} from 'lucide-react'
import useDepositStore from '../store/depositStore'

const DepositRequestList = () => {
    const {
        depositRequests,
        fetchDepositRequests,
        approveDepositRequest,
        rejectDepositRequest,
        loading,
    } = useDepositStore()

    useEffect(() => {
        fetchDepositRequests({ estado: 'pendiente' })
    }, [fetchDepositRequests])

    const fmt = (value) =>
        new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ',
        }).format(value || 0)

    const aprobar = async (id) => {
        const toastId = toast.loading('Aprobando solicitud...')

        try {
            await approveDepositRequest(id)
            toast.success('Solicitud aprobada y depósito acreditado', {
                id: toastId,
            })
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'Error al aprobar la solicitud',
                { id: toastId }
            )
        }
    }

    const rechazar = async (id) => {
        const motivoRechazo =
            window.prompt('Ingrese el motivo de rechazo') ||
            'Solicitud rechazada por administración'

        const toastId = toast.loading('Rechazando solicitud...')

        try {
            await rejectDepositRequest(id, { motivoRechazo })
            toast.success('Solicitud rechazada correctamente', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'Error al rechazar la solicitud',
                { id: toastId }
            )
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
        >
            <div className="mb-8 overflow-hidden rounded-[2rem] border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                <div className="premium-gold-line mb-6 h-px w-full" />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-gradient-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                            <Banknote size={28} className="text-[#5b3a0d]" />
                        </div>

                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                Validación administrativa
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                Solicitudes de Depósito
                            </h1>

                            <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                Revise depósitos en efectivo o cheque solicitados por clientes.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchDepositRequests({ estado: 'pendiente' })
                        }
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d7bc73]/55 bg-white/52 px-5 py-3 text-sm font-black text-[#6f5a33] shadow-[0_12px_26px_rgba(92,64,19,0.08)] transition-all hover:border-[#b98219]/60 hover:bg-[#fff8df] hover:text-[#3f2c12] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? 'animate-spin' : ''}
                        />
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl">
                <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                {depositRequests.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b]">
                            <Clock size={34} />
                        </div>

                        <p className="text-sm font-semibold text-[#8a6a3a]">
                            No hay solicitudes pendientes.
                        </p>
                    </div>
                ) : (
                    <div className="custom-scrollbar overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#d7bc73]/28 bg-[#ead9ad]/22">
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Cuenta
                                    </th>

                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Tipo
                                    </th>

                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Monto
                                    </th>

                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Referencia
                                    </th>

                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Comentario
                                    </th>

                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#d7bc73]/28">
                                {depositRequests.map((request) => (
                                    <tr
                                        key={request._id}
                                        className="transition-colors hover:bg-white/35"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                                                    <CreditCard size={16} />
                                                </div>

                                                <div>
                                                    <p className="font-mono text-sm font-black text-[#3f2c12]">
                                                        {request.cuenta?.numeroCuenta ||
                                                            'No disponible'}
                                                    </p>

                                                    <p className="mt-0.5 text-xs font-semibold capitalize text-[#8a6a3a]">
                                                        {request.cuenta?.tipoCuenta || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-5">
                                            <span className="rounded-full border border-[#d7bc73]/50 bg-[#fff8df] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#8a611b]">
                                                {request.tipoDeposito}
                                            </span>
                                        </td>

                                        <td className="px-8 py-5 text-right text-sm font-black text-[#3f2c12]">
                                            {fmt(request.monto)}
                                        </td>

                                        <td className="px-8 py-5 font-mono text-xs font-semibold text-[#7a6849]">
                                            {request.referencia || '-'}
                                        </td>

                                        <td className="max-w-xs px-8 py-5 text-xs font-semibold text-[#8a6a3a]">
                                            {request.comentarioUsuario || '-'}
                                        </td>

                                        <td className="px-8 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        aprobar(request._id)
                                                    }
                                                    disabled={loading}
                                                    className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2 text-emerald-700 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Aprobar"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        rechazar(request._id)
                                                    }
                                                    disabled={loading}
                                                    className="rounded-xl border border-red-200 bg-red-50/80 p-2 text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Rechazar"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default DepositRequestList