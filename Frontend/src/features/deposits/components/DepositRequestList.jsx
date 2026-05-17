import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
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
            toast.success('Solicitud aprobada y depósito acreditado', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al aprobar la solicitud',
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
                error?.response?.data?.message || 'Error al rechazar la solicitud',
                { id: toastId }
            )
        }
    }

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white">
                        Solicitudes de Depósito
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Revise depósitos en efectivo o cheque solicitados por clientes.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => fetchDepositRequests({ estado: 'pendiente' })}
                    disabled={loading}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all border border-zinc-800 disabled:opacity-50"
                >
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                {depositRequests.length === 0 ? (
                    <div className="py-16 text-center">
                        <Clock size={42} className="mx-auto text-zinc-700 mb-3" />
                        <p className="text-zinc-500">
                            No hay solicitudes pendientes.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="text-left px-6 py-4">Cuenta</th>
                                    <th className="text-left px-6 py-4">Tipo</th>
                                    <th className="text-right px-6 py-4">Monto</th>
                                    <th className="text-left px-6 py-4">Referencia</th>
                                    <th className="text-left px-6 py-4">Comentario</th>
                                    <th className="text-right px-6 py-4">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-800">
                                {depositRequests.map((request) => (
                                    <tr key={request._id} className="hover:bg-zinc-950/40">
                                        <td className="px-6 py-4">
                                            <p className="text-white font-semibold">
                                                {request.cuenta?.numeroCuenta || 'No disponible'}
                                            </p>
                                            <p className="text-zinc-500 text-xs">
                                                {request.cuenta?.tipoCuenta || ''}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4 text-zinc-300 capitalize">
                                            {request.tipoDeposito}
                                        </td>

                                        <td className="px-6 py-4 text-right text-white font-bold">
                                            {fmt(request.monto)}
                                        </td>

                                        <td className="px-6 py-4 text-zinc-400">
                                            {request.referencia || '-'}
                                        </td>

                                        <td className="px-6 py-4 text-zinc-400 max-w-xs">
                                            {request.comentarioUsuario || '-'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => aprobar(request._id)}
                                                    disabled={loading}
                                                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                                                    title="Aprobar"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => rechazar(request._id)}
                                                    disabled={loading}
                                                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
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
        </div>
    )
}

export default DepositRequestList