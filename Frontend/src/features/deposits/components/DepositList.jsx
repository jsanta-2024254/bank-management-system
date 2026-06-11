import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Search,
    Calendar,
    DollarSign,
    History,
    RotateCcw,
    Landmark,
    Banknote,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import useDepositStore from '../store/depositStore'
import DepositForm from './DepositForm'

const DepositList = () => {
    const { deposits, loading, error, fetchDeposits, revertDeposit } = useDepositStore()

    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchDeposits()
    }, [fetchDeposits])

    const handleCloseForm = () => {
        setShowForm(false)
        fetchDeposits()
    }

    const handleRevert = async (id) => {
        const toastId = toast.loading('Revirtiendo depósito...')

        try {
            await revertDeposit(id)
            toast.success('Depósito revertido con éxito', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al revertir el depósito',
                { id: toastId }
            )
        }
    }

    const filtered = (deposits || []).filter((d) => {
        const q = search.toLowerCase()

        return (
            (d.descripcion || '').toLowerCase().includes(q) ||
            (d.cuenta?.numeroCuenta || '').toLowerCase().includes(q)
        )
    })

    const fmt = (n) =>
        new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ',
        }).format(n || 0)

    const dateFmt = (d) =>
        d
            ? new Date(d).toLocaleDateString('es-GT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '—'

    const canRevert = (d) => {
        if (d.revertido) return false

        const now = new Date()
        const limit = new Date(
            d.reversibleHasta || new Date(d.createdAt).getTime() + 60000
        )

        return now < limit
    }

    const totalDepositado = (deposits || []).reduce(
        (sum, deposit) =>
            deposit.revertido
                ? sum
                : sum + Number(deposit.montoActual || deposit.monto || 0),
        0
    )

    const totalRevertidos = (deposits || []).filter((deposit) => deposit.revertido).length

    const Skeleton = ({ className }) => (
        <div className={`animate-pulse bg-[#ead9ad]/70 ${className}`} />
    )

    const StatusBadge = ({ active, activeText, inactiveText }) => (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
                active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-[#d7bc73]/40 bg-[#ead9ad]/35 text-[#8a6a3a]'
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    active ? 'bg-emerald-600' : 'bg-[#9a6b16]'
                }`}
            />
            {active ? activeText : inactiveText}
        </span>
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
        >
            {showForm && <DepositForm onClose={handleCloseForm} />}

            <div className="mb-8 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                <div className="premium-gold-line mb-6 h-px w-full" />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                            <Banknote size={28} className="text-[#5b3a0d]" />
                        </div>

                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                Operación administrativa
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                Depósitos
                            </h1>

                            <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                Gestión administrativa de depósitos a cuentas.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] active:scale-95 sm:w-auto"
                    >
                        <Plus size={18} />
                        Nuevo Depósito
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Total registros
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {deposits.length}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Monto activo
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {fmt(totalDepositado)}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Revertidos
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {totalRevertidos}
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative mb-6">
                <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                />

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por descripción o número de cuenta..."
                    className="w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-3.5 pl-10 pr-4 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
                />
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
                                    Monto
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Cuenta Destino
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Fecha
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Estado
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Descripción
                                </th>

                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#d7bc73]/28">
                            {loading && deposits.length === 0 ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5">
                                            <Skeleton className="h-10 w-32 rounded-xl" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-10 w-40 rounded-xl" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-5 w-32 rounded-lg" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-5 w-48 rounded-lg" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-8 py-16 text-center text-[#8a6a3a]"
                                    >
                                        <History
                                            size={32}
                                            className="mx-auto mb-3 opacity-40"
                                        />

                                        <p className="font-bold">
                                            No se encontraron depósitos
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filtered.map((d) => (
                                        <motion.tr
                                            key={d._id || d.id || d.Id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="transition-colors hover:bg-white/35"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                                                            d.revertido
                                                                ? 'border-[#d7bc73]/40 bg-[#ead9ad]/35 text-[#8a6a3a]'
                                                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        }`}
                                                    >
                                                        <DollarSign size={18} />
                                                    </div>

                                                    <span
                                                        className={`text-sm font-black ${
                                                            d.revertido
                                                                ? 'text-[#8a6a3a] line-through'
                                                                : 'text-[#3f2c12]'
                                                        }`}
                                                    >
                                                        {fmt(d.montoActual || d.monto)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Landmark
                                                            size={12}
                                                            className="text-[#9a6b16]/70"
                                                        />

                                                        <span className="font-mono text-xs font-black text-[#3f2c12]">
                                                            {d.cuenta?.numeroCuenta || 'N/A'}
                                                        </span>
                                                    </div>

                                                    <span className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/70">
                                                        {d.cuenta?.tipoCuenta || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-[#8a6a3a]">
                                                    <Calendar size={12} />
                                                    {dateFmt(d.createdAt || d.fecha)}
                                                </div>
                                            </td>

                                            <td className="px-8 py-5">
                                                <StatusBadge
                                                    active={!d.revertido}
                                                    activeText="Completado"
                                                    inactiveText="Revertido"
                                                />
                                            </td>

                                            <td className="px-8 py-5 text-xs font-semibold italic text-[#8a6a3a]">
                                                {d.descripcion || 'Sin descripción'}
                                            </td>

                                            <td className="px-8 py-5 text-right">
                                                {canRevert(d) && (
                                                    <button
                                                        onClick={() =>
                                                            handleRevert(
                                                                d._id || d.id || d.Id
                                                            )
                                                        }
                                                        title="Revertir depósito disponible por 1 minuto"
                                                        className="rounded-xl border border-red-200 bg-red-50/80 p-2 text-red-700 transition-all hover:bg-red-100"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}

export default DepositList