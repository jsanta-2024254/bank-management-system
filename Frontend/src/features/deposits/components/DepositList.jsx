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

    const Skeleton = ({ className }) => (
        <div className={`bg-zinc-800 animate-pulse ${className}`} />
    )

    const StatusBadge = ({ active, activeText, inactiveText }) => (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700/40 text-zinc-500'
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    active ? 'bg-green-400' : 'bg-zinc-500'
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Depósitos</h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Gestión administrativa de depósitos a cuentas.
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus size={18} />
                    Nuevo Depósito
                </button>
            </div>

            <div className="relative mb-6">
                <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por descripción o número de cuenta..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                />
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
                                    Monto
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Cuenta Destino
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Fecha
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Estado
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Descripción
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
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
                                            <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-zinc-500">
                                        <History size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No se encontraron depósitos</p>
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
                                            className="hover:bg-white/3 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
                                                            d.revertido
                                                                ? 'bg-zinc-800/50 border-zinc-700 text-zinc-500'
                                                                : 'bg-blue-600/10 border-blue-600/20 text-blue-400'
                                                        }`}
                                                    >
                                                        <DollarSign size={18} />
                                                    </div>
                                                    <span
                                                        className={`font-bold text-sm ${
                                                            d.revertido
                                                                ? 'text-zinc-500 line-through'
                                                                : 'text-white'
                                                        }`}
                                                    >
                                                        {fmt(d.montoActual || d.monto)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Landmark size={12} className="text-zinc-500" />
                                                        <span className="text-white font-mono text-xs">
                                                            {d.cuenta?.numeroCuenta || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <span className="text-zinc-500 text-[10px] uppercase font-bold mt-1 tracking-widest">
                                                        {d.cuenta?.tipoCuenta || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-zinc-400 text-xs">
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

                                            <td className="px-8 py-5 text-zinc-500 text-xs italic">
                                                {d.descripcion || 'Sin descripción'}
                                            </td>

                                            <td className="px-8 py-5 text-right">
                                                {canRevert(d) && (
                                                    <button
                                                        onClick={() => handleRevert(d._id || d.id || d.Id)}
                                                        title="Revertir depósito disponible por 1 minuto"
                                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
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