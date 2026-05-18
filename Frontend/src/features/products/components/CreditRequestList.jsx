import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    BadgeDollarSign,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    RefreshCw,
    Search,
    UserRound,
    XCircle,
} from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import useProductStore from '../store/productStore'

const estados = [
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aprobada', label: 'Aprobadas' },
    { value: 'rechazada', label: 'Rechazadas' },
    { value: 'todas', label: 'Todas' },
]

const obtenerId = (item) => item?._id || item?.id || item?.Id || ''

const obtenerParametrosFiltro = (estado) => {
    if (!estado || estado === 'todas') return {}
    return { estado }
}

const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
    }).format(Number(valor || 0))

const formatearFecha = (valor) => {
    if (!valor) return '—'

    return new Intl.DateTimeFormat('es-GT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(valor))
}

const obtenerTextoUsuario = (usuario) => {
    if (!usuario) return 'N/A'
    if (typeof usuario === 'string') return usuario

    return (
        usuario.nombre ||
        usuario.name ||
        usuario.email ||
        usuario.correo ||
        usuario.uid ||
        usuario.id ||
        usuario._id ||
        'N/A'
    )
}

const obtenerNombreProducto = (request) => {
    if (request?.producto?.nombre) return request.producto.nombre
    return request?.nombre || 'Solicitud de crédito'
}

const obtenerCuenta = (request) => {
    if (!request?.cuenta) return 'Cuenta no disponible'
    if (typeof request.cuenta === 'string') return request.cuenta

    return request.cuenta.numeroCuenta || request.cuenta._id || request.cuenta.id || 'Cuenta no disponible'
}

const obtenerTipoCuenta = (request) => {
    if (!request?.cuenta || typeof request.cuenta === 'string') return '—'
    return request.cuenta.tipoCuenta || '—'
}

const obtenerUsuarioCuenta = (request) => {
    if (!request?.cuenta || typeof request.cuenta === 'string') {
        return obtenerTextoUsuario(request?.usuario)
    }

    return obtenerTextoUsuario(request.cuenta.usuario || request.usuario)
}

const obtenerTextoOrigen = (origen) => {
    if (origen === 'oportunidad_banco') return 'Oportunidad del banco'
    if (origen === 'solicitud_cliente') return 'Solicitud del cliente'
    return 'No definido'
}

const obtenerClaseEstado = (estado) => {
    if (estado === 'aprobada') return 'bg-emerald-500/10 text-emerald-400'
    if (estado === 'rechazada') return 'bg-red-500/10 text-red-400'
    if (estado === 'pendiente') return 'bg-amber-500/10 text-amber-400'
    if (estado === 'finalizada') return 'bg-blue-500/10 text-blue-400'
    return 'bg-zinc-700/40 text-zinc-400'
}

const obtenerValoresAprobacion = (request) => ({
    montoAprobado: String(request?.montoAprobado || request?.montoSolicitado || ''),
    tasaInteres: String(
        request?.tasaInteresAplicada ?? request?.producto?.tasaInteres ?? 0
    ),
    moraPorcentaje: String(
        request?.moraPorcentajeAplicada ?? request?.producto?.moraPorcentaje ?? 5
    ),
    comentarioAdmin: '',
})

const CreditRequestList = () => {
    const {
        creditRequests,
        fetchCreditRequests,
        approveCreditRequest,
        rejectCreditRequest,
        loading,
        error,
    } = useProductStore()

    const [filtroEstado, setFiltroEstado] = useState('pendiente')
    const [search, setSearch] = useState('')
    const [decision, setDecision] = useState(null)

    useEffect(() => {
        fetchCreditRequests(obtenerParametrosFiltro(filtroEstado))
    }, [fetchCreditRequests, filtroEstado])

    const solicitudesFiltradas = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) return creditRequests || []

        return (creditRequests || []).filter((request) => {
            const valores = [
                obtenerNombreProducto(request),
                obtenerCuenta(request),
                obtenerTipoCuenta(request),
                obtenerUsuarioCuenta(request),
                request.estado,
                request.origenSolicitud,
                request.comentarioCliente,
                request.comentarioAdmin,
            ]

            return valores.join(' ').toLowerCase().includes(query)
        })
    }, [creditRequests, search])

    const actualizarSolicitudes = () => {
        fetchCreditRequests(obtenerParametrosFiltro(filtroEstado))
    }

    const abrirAprobacion = (request) => {
        setDecision({
            tipo: 'aprobar',
            request,
            form: obtenerValoresAprobacion(request),
        })
    }

    const abrirRechazo = (request) => {
        setDecision({
            tipo: 'rechazar',
            request,
            form: {
                comentarioAdmin: '',
            },
        })
    }

    const cerrarDecision = () => {
        setDecision(null)
    }

    const cambiarDecision = (event) => {
        const { name, value } = event.target

        setDecision((actual) => ({
            ...actual,
            form: {
                ...actual.form,
                [name]: value,
            },
        }))
    }

    const procesarDecision = async (event) => {
        event.preventDefault()

        if (!decision?.request) return

        const id = obtenerId(decision.request)
        const comentarioAdmin = decision.form.comentarioAdmin?.trim() || ''

        if (decision.tipo === 'rechazar' && !comentarioAdmin) {
            toast.error('Ingrese el motivo del rechazo')
            return
        }

        const toastId = toast.loading(
            decision.tipo === 'aprobar'
                ? 'Aprobando y desembolsando crédito...'
                : 'Rechazando solicitud de crédito...'
        )

        try {
            if (decision.tipo === 'aprobar') {
                await approveCreditRequest(id, {
                    montoAprobado: Number(decision.form.montoAprobado),
                    tasaInteres: Number(decision.form.tasaInteres),
                    moraPorcentaje: Number(decision.form.moraPorcentaje),
                    comentarioAdmin,
                })

                toast.success('Crédito aprobado y desembolsado correctamente', {
                    id: toastId,
                })
            } else {
                await rejectCreditRequest(id, { comentarioAdmin })

                toast.success('Solicitud de crédito rechazada correctamente', {
                    id: toastId,
                })
            }

            cerrarDecision()
            await fetchCreditRequests(obtenerParametrosFiltro(filtroEstado))
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'No se pudo procesar la solicitud de crédito',
                { id: toastId }
            )
        }
    }

    const Skeleton = ({ className }) => (
        <div className={`bg-zinc-800 animate-pulse ${className}`} />
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
        >
            {decision && (
                <Modal
                    title={
                        decision.tipo === 'aprobar'
                            ? 'Aprobar solicitud de crédito'
                            : 'Rechazar solicitud de crédito'
                    }
                    onClose={cerrarDecision}
                >
                    <form onSubmit={procesarDecision} className="space-y-5">
                        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
                            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">
                                Solicitud
                            </p>

                            <p className="text-white font-bold">
                                {obtenerNombreProducto(decision.request)}
                            </p>

                            <p className="text-zinc-400 text-xs mt-1">
                                Cuenta {obtenerCuenta(decision.request)} · Usuario:{' '}
                                {obtenerUsuarioCuenta(decision.request)}
                            </p>

                            <p className="text-zinc-400 text-xs mt-1">
                                Monto solicitado:{' '}
                                <span className="text-white font-semibold">
                                    {formatearMoneda(decision.request.montoSolicitado)}
                                </span>{' '}
                                · Plazo: {decision.request.plazoMeses} meses
                            </p>
                        </div>

                        {decision.tipo === 'aprobar' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                                        Monto aprobado
                                    </label>

                                    <input
                                        name="montoAprobado"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={decision.form.montoAprobado}
                                        onChange={cambiarDecision}
                                        required
                                        disabled={loading}
                                        className="w-full bg-zinc-950/70 border border-zinc-800 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm disabled:opacity-60"
                                    />
                                </div>

                                <div>
                                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                                        Tasa %
                                    </label>

                                    <input
                                        name="tasaInteres"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={decision.form.tasaInteres}
                                        onChange={cambiarDecision}
                                        required
                                        disabled={loading}
                                        className="w-full bg-zinc-950/70 border border-zinc-800 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm disabled:opacity-60"
                                    />
                                </div>

                                <div>
                                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                                        Mora %
                                    </label>

                                    <input
                                        name="moraPorcentaje"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={decision.form.moraPorcentaje}
                                        onChange={cambiarDecision}
                                        required
                                        disabled={loading}
                                        className="w-full bg-zinc-950/70 border border-zinc-800 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm disabled:opacity-60"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                <p className="text-red-300 text-sm font-semibold">
                                    Esta acción marcará la solicitud como rechazada y no realizará ningún desembolso.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">
                                Comentario administrativo
                            </label>

                            <textarea
                                name="comentarioAdmin"
                                value={decision.form.comentarioAdmin}
                                onChange={cambiarDecision}
                                rows={3}
                                required={decision.tipo === 'rechazar'}
                                disabled={loading}
                                placeholder={
                                    decision.tipo === 'aprobar'
                                        ? 'Comentario opcional para el cliente o auditoría...'
                                        : 'Indique el motivo del rechazo...'
                                }
                                className="w-full bg-zinc-950/70 border border-zinc-800 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm resize-none disabled:opacity-60 placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={cerrarDecision}
                                disabled={loading}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 text-white font-bold py-4 rounded-2xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                                    decision.tipo === 'aprobar'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                                        : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'
                                }`}
                            >
                                {decision.tipo === 'aprobar' ? (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Aprobar crédito
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={18} />
                                        Rechazar solicitud
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Solicitudes de Crédito
                    </h1>

                    <p className="text-zinc-500 text-sm mt-1">
                        Revise, apruebe o rechace créditos solicitados por los clientes.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={actualizarSolicitudes}
                    disabled={loading}
                    className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all border border-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 mb-6">
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por producto, cuenta, usuario, estado o comentario..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {estados.map((estado) => (
                        <button
                            key={estado.value}
                            type="button"
                            onClick={() => setFiltroEstado(estado.value)}
                            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                filtroEstado === estado.value
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                            }`}
                        >
                            {estado.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 text-center">
                    {error}
                </div>
            )}

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Solicitud
                                </th>

                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Cliente / Cuenta
                                </th>

                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5 text-right">
                                    Monto
                                </th>

                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Condiciones
                                </th>

                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Estado
                                </th>

                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                            {loading && solicitudesFiltradas.length === 0 ? (
                                [1, 2, 3].map((item) => (
                                    <tr key={item}>
                                        <td className="px-8 py-5">
                                            <Skeleton className="h-12 w-52 rounded-xl" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-12 w-48 rounded-xl" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-6 w-28 rounded-lg ml-auto" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-12 w-44 rounded-xl" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-8 w-20 rounded-lg ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : solicitudesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-zinc-500">
                                        <Clock size={36} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">
                                            No se encontraron solicitudes de crédito
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {solicitudesFiltradas.map((request) => {
                                        const id = obtenerId(request)
                                        const puedeGestionar = request.estado === 'pendiente'

                                        return (
                                            <motion.tr
                                                key={id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-white/3 transition-colors"
                                            >
                                                <td className="px-8 py-5 align-top">
                                                    <div className="flex items-start gap-3 min-w-65">
                                                        <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0">
                                                            <BadgeDollarSign
                                                                size={17}
                                                                className="text-blue-400"
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="text-white font-bold text-sm">
                                                                {obtenerNombreProducto(request)}
                                                            </p>

                                                            <p className="text-zinc-500 text-xs mt-1">
                                                                {obtenerTextoOrigen(request.origenSolicitud)}
                                                            </p>

                                                            <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                                                                <CalendarDays size={12} />
                                                                {formatearFecha(request.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 align-top">
                                                    <div className="space-y-2 min-w-55">
                                                        <p className="text-zinc-300 text-xs flex items-center gap-2">
                                                            <UserRound size={13} className="text-zinc-500" />
                                                            {obtenerUsuarioCuenta(request)}
                                                        </p>

                                                        <p className="text-white font-mono text-xs flex items-center gap-2">
                                                            <CreditCard size={13} className="text-zinc-500" />
                                                            {obtenerCuenta(request)}
                                                        </p>

                                                        <p className="text-zinc-500 text-xs capitalize">
                                                            {obtenerTipoCuenta(request)}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 align-top text-right">
                                                    <p className="text-white font-black text-sm">
                                                        {formatearMoneda(request.montoSolicitado)}
                                                    </p>

                                                    {request.montoAprobado && (
                                                        <p className="text-emerald-400 text-xs mt-1">
                                                            Aprobado:{' '}
                                                            {formatearMoneda(request.montoAprobado)}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-8 py-5 align-top">
                                                    <div className="text-xs text-zinc-400 min-w-47.5 space-y-1">
                                                        <p>
                                                            Plazo:{' '}
                                                            <span className="text-white font-semibold">
                                                                {request.plazoMeses} meses
                                                            </span>
                                                        </p>

                                                        <p>
                                                            Tasa:{' '}
                                                            <span className="text-white font-semibold">
                                                                {Number(request.tasaInteresAplicada || 0)}%
                                                            </span>
                                                        </p>

                                                        <p>
                                                            Cuota estimada:{' '}
                                                            <span className="text-white font-semibold">
                                                                {formatearMoneda(
                                                                    request.cuotaMensualEstimada
                                                                )}
                                                            </span>
                                                        </p>

                                                        {request.comentarioCliente && (
                                                            <p className="text-zinc-500 line-clamp-2 pt-1">
                                                                Cliente: {request.comentarioCliente}
                                                            </p>
                                                        )}

                                                        {request.comentarioAdmin && (
                                                            <p className="text-zinc-500 line-clamp-2 pt-1">
                                                                Admin: {request.comentarioAdmin}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 align-top">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${obtenerClaseEstado(
                                                            request.estado
                                                        )}`}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        {request.estado || 'pendiente'}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-5 align-top">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {puedeGestionar ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => abrirAprobacion(request)}
                                                                    disabled={loading}
                                                                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
                                                                    title="Aprobar crédito"
                                                                >
                                                                    <CheckCircle2 size={18} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => abrirRechazo(request)}
                                                                    disabled={loading}
                                                                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-all"
                                                                    title="Rechazar crédito"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-zinc-600 text-xs font-semibold">
                                                                Sin acciones
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}

export default CreditRequestList