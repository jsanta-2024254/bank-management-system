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
    Landmark,
    Percent,
    MessageSquare,
    Coins,
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

    return (
        request.cuenta.numeroCuenta ||
        request.cuenta._id ||
        request.cuenta.id ||
        'Cuenta no disponible'
    )
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
    if (estado === 'aprobada') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }

    if (estado === 'rechazada') {
        return 'border-red-200 bg-red-50 text-red-700'
    }

    if (estado === 'pendiente') {
        return 'border-amber-200 bg-amber-50 text-amber-700'
    }

    if (estado === 'finalizada') {
        return 'border-blue-200 bg-blue-50 text-blue-700'
    }

    return 'border-[#d7bc73]/40 bg-[#ead9ad]/35 text-[#8a6a3a]'
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

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-[#ead9ad]/70 ${className}`} />
)

const inputClass =
    'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

const labelClass =
    'mb-3 ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

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

    const totalSolicitado = useMemo(
        () =>
            solicitudesFiltradas.reduce(
                (sum, request) => sum + Number(request.montoSolicitado || 0),
                0
            ),
        [solicitudesFiltradas]
    )

    const totalPendientes = useMemo(
        () =>
            solicitudesFiltradas.filter(
                (request) => request.estado === 'pendiente'
            ).length,
        [solicitudesFiltradas]
    )

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
                        <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                                    <BadgeDollarSign size={20} />
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Solicitud
                                    </p>

                                    <p className="truncate text-sm font-black text-[#3f2c12]">
                                        {obtenerNombreProducto(decision.request)}
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[#7a6849]">
                                        Cuenta {obtenerCuenta(decision.request)} · Usuario:{' '}
                                        {obtenerUsuarioCuenta(decision.request)}
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[#7a6849]">
                                        Monto solicitado:{' '}
                                        <span className="font-black text-[#3f2c12]">
                                            {formatearMoneda(
                                                decision.request.montoSolicitado
                                            )}
                                        </span>{' '}
                                        · Plazo: {decision.request.plazoMeses} meses
                                    </p>
                                </div>
                            </div>
                        </div>

                        {decision.tipo === 'aprobar' ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label className={labelClass}>
                                        Monto aprobado
                                    </label>

                                    <div className="relative">
                                        <Coins
                                            size={14}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                                        />

                                        <input
                                            name="montoAprobado"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={decision.form.montoAprobado}
                                            onChange={cambiarDecision}
                                            required
                                            disabled={loading}
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Tasa %</label>

                                    <div className="relative">
                                        <Percent
                                            size={14}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                                        />

                                        <input
                                            name="tasaInteres"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={decision.form.tasaInteres}
                                            onChange={cambiarDecision}
                                            required
                                            disabled={loading}
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Mora %</label>

                                    <div className="relative">
                                        <Percent
                                            size={14}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                                        />

                                        <input
                                            name="moraPorcentaje"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={decision.form.moraPorcentaje}
                                            onChange={cambiarDecision}
                                            required
                                            disabled={loading}
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
                                <p className="text-sm font-semibold leading-6 text-red-700">
                                    Esta acción marcará la solicitud como rechazada y no realizará ningún desembolso.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>
                                Comentario administrativo
                            </label>

                            <div className="relative">
                                <MessageSquare
                                    size={14}
                                    className="absolute left-4 top-4 text-[#9a6b16]/70"
                                />

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
                                    className={`${inputClass} resize-none pl-10`}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={cerrarDecision}
                                disabled={loading}
                                className="flex-1 rounded-2xl border border-[#d7bc73]/55 bg-white/45 py-4 text-sm font-black text-[#6f5a33] transition-all hover:bg-white/85 hover:text-[#3f2c12] disabled:cursor-not-allowed disabled:opacity-55"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-55 ${
                                    decision.tipo === 'aprobar'
                                        ? 'border border-emerald-300 bg-emerald-700 shadow-[0_18px_36px_rgba(4,120,87,0.22)] hover:bg-emerald-800'
                                        : 'border border-red-300 bg-red-700 shadow-[0_18px_36px_rgba(185,28,28,0.22)] hover:bg-red-800'
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

            <div className="mb-8 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                <div className="premium-gold-line mb-6 h-px w-full" />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                            <Landmark size={28} className="text-[#5b3a0d]" />
                        </div>

                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                Gestión crediticia
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                Solicitudes de Crédito
                            </h1>

                            <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                Revise, apruebe o rechace créditos solicitados por los clientes.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={actualizarSolicitudes}
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

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Solicitudes visibles
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {solicitudesFiltradas.length}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Pendientes visibles
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {totalPendientes}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Monto solicitado visible
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {formatearMoneda(totalSolicitado)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto]">
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                    />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por producto, cuenta, usuario, estado o comentario..."
                        className="w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-3.5 pl-10 pr-4 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {estados.map((estado) => (
                        <button
                            key={estado.value}
                            type="button"
                            onClick={() => setFiltroEstado(estado.value)}
                            className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition-all ${
                                filtroEstado === estado.value
                                    ? 'border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] text-white shadow-[0_14px_28px_rgba(154,107,22,0.22)]'
                                    : 'border-[#d7bc73]/45 bg-white/45 text-[#6f5a33] hover:bg-white/85 hover:text-[#3f2c12]'
                            }`}
                        >
                            {estado.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-center text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            <div className="relative overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl">
                <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                <div className="custom-scrollbar overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#d7bc73]/28 bg-[#ead9ad]/22">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Solicitud
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Cliente / Cuenta
                                </th>

                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Monto
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Condiciones
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Estado
                                </th>

                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#d7bc73]/28">
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
                                            <Skeleton className="ml-auto h-6 w-28 rounded-lg" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-12 w-44 rounded-xl" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="ml-auto h-8 w-20 rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : solicitudesFiltradas.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-8 py-16 text-center text-[#8a6a3a]"
                                    >
                                        <Clock
                                            size={36}
                                            className="mx-auto mb-3 opacity-40"
                                        />

                                        <p className="font-bold">
                                            No se encontraron solicitudes de crédito
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {solicitudesFiltradas.map((request) => {
                                        const id = obtenerId(request)
                                        const puedeGestionar =
                                            request.estado === 'pendiente'

                                        return (
                                            <motion.tr
                                                key={id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="transition-colors hover:bg-white/35"
                                            >
                                                <td className="px-8 py-5 align-top">
                                                    <div className="flex min-w-65 items-start gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                                                            <BadgeDollarSign size={17} />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-black text-[#3f2c12]">
                                                                {obtenerNombreProducto(request)}
                                                            </p>

                                                            <p className="mt-1 text-xs font-semibold text-[#8a6a3a]">
                                                                {obtenerTextoOrigen(
                                                                    request.origenSolicitud
                                                                )}
                                                            </p>

                                                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#8a6a3a]">
                                                                <CalendarDays size={12} />
                                                                {formatearFecha(
                                                                    request.createdAt
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 align-top">
                                                    <div className="min-w-55 space-y-2">
                                                        <p className="flex items-center gap-2 text-xs font-semibold text-[#7a6849]">
                                                            <UserRound
                                                                size={13}
                                                                className="text-[#9a6b16]/70"
                                                            />
                                                            {obtenerUsuarioCuenta(request)}
                                                        </p>

                                                        <p className="flex items-center gap-2 font-mono text-xs font-black text-[#3f2c12]">
                                                            <CreditCard
                                                                size={13}
                                                                className="text-[#9a6b16]/70"
                                                            />
                                                            {obtenerCuenta(request)}
                                                        </p>

                                                        <p className="text-xs font-semibold capitalize text-[#8a6a3a]">
                                                            {obtenerTipoCuenta(request)}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 text-right align-top">
                                                    <p className="text-sm font-black text-[#3f2c12]">
                                                        {formatearMoneda(
                                                            request.montoSolicitado
                                                        )}
                                                    </p>

                                                    {request.montoAprobado && (
                                                        <p className="mt-1 text-xs font-black text-emerald-700">
                                                            Aprobado:{' '}
                                                            {formatearMoneda(
                                                                request.montoAprobado
                                                            )}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-8 py-5 align-top">
                                                    <div className="min-w-47.5 space-y-1 text-xs font-semibold text-[#8a6a3a]">
                                                        <p>
                                                            Plazo:{' '}
                                                            <span className="font-black text-[#3f2c12]">
                                                                {request.plazoMeses} meses
                                                            </span>
                                                        </p>

                                                        <p>
                                                            Tasa:{' '}
                                                            <span className="font-black text-[#3f2c12]">
                                                                {Number(
                                                                    request.tasaInteresAplicada ||
                                                                        0
                                                                )}
                                                                %
                                                            </span>
                                                        </p>

                                                        <p>
                                                            Cuota estimada:{' '}
                                                            <span className="font-black text-[#3f2c12]">
                                                                {formatearMoneda(
                                                                    request.cuotaMensualEstimada
                                                                )}
                                                            </span>
                                                        </p>

                                                        {request.comentarioCliente && (
                                                            <p className="pt-1 text-[#8a6a3a]">
                                                                Cliente:{' '}
                                                                {request.comentarioCliente}
                                                            </p>
                                                        )}

                                                        {request.comentarioAdmin && (
                                                            <p className="pt-1 text-[#8a6a3a]">
                                                                Admin:{' '}
                                                                {request.comentarioAdmin}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 align-top">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black capitalize ${obtenerClaseEstado(
                                                            request.estado
                                                        )}`}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                        {request.estado || 'pendiente'}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-5 align-top">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {puedeGestionar ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        abrirAprobacion(
                                                                            request
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2 text-emerald-700 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    title="Aprobar crédito"
                                                                >
                                                                    <CheckCircle2 size={18} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        abrirRechazo(
                                                                            request
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    className="rounded-xl border border-red-200 bg-red-50/80 p-2 text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    title="Rechazar crédito"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-[#8a6a3a]">
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