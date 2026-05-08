import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PlusCircle, Search, Calendar, DollarSign, History, Hash, CheckCircle2, XCircle, RotateCcw, Landmark } from 'lucide-react'
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

    const handleRevert = async (id) => {
        const toastId = toast.loading('Revirtiendo depósito...')
        try {
            await revertDeposit(id)
            toast.success('Depósito revertido con éxito', { id: toastId })
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error al revertir el depósito', { id: toastId })
        }
    }

    const filtered = (deposits || []).filter((d) => {
        const q = search.toLowerCase()
        return (
            (d.descripcion || '').toLowerCase().includes(q) ||
            (d.cuenta?.numeroCuenta || '').toLowerCase().includes(q)
        )
    })

    const fmt = (n) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n || 0)
    const dateFmt = (d) => new Date(d).toLocaleDateString('es-GT', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    const canRevert = (d) => {
        if (d.revertido) return false
        const now = new Date()
        const limit = new Date(d.reversibleHasta || new Date(d.createdAt).getTime() + 60000)
        return now < limit
    }

    const Skeleton = ({ className }) => (
        <div className={`bg-zinc-800 animate-pulse ${className}`} />
    )

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
            {showForm && (
                <DepositForm
                    onClose={() => {
                        setShowForm(false)
                        fetchDeposits()
                    }}
                />
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Depósitos</h1>
                    <p className="text-zinc-500 text-sm mt-1">Gestión administrativa de depósitos a cuentas.</p>
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
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por descripción o número de cuenta..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
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
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Monto</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Cuenta Destino</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Fecha</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Estado</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Descripción</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && deposits.length === 0 ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5"><Skeleton className="h-10 w-32 rounded-xl" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-10 w-40 rounded-xl" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-5 w-32 rounded-lg" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-5 w-48 rounded-lg" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-600">
                                                <History size={24} />
                                            </div>
                                            <p className="text-zinc-500 text-sm font-medium">No se encontraron depósitos.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filtered.map((d) => (
                                        <motion.tr 
                                            key={d._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                                                        d.revertido ? 'bg-zinc-800/50 border-zinc-700 text-zinc-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                        <DollarSign size={18} />
                                                    </div>
                                                    <span className={`font-bold text-sm ${d.revertido ? 'text-zinc-500 line-through' : 'text-emerald-400'}`}>
                                                        {fmt(d.montoActual)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Landmark size={12} className="text-zinc-500" />
                                                        <span className="text-white font-mono text-xs">{d.cuenta?.numeroCuenta || 'N/A'}</span>
                                                    </div>
                                                    <span className="text-zinc-500 text-[10px] uppercase font-bold mt-1 tracking-tighter">
                                                        {d.cuenta?.tipoCuenta || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                                                    <Calendar size={12} className="text-zinc-500" />
                                                    {dateFmt(d.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {d.revertido ? (
                                                    <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-full w-fit">
                                                        <XCircle size={12} />
                                                        Revertido
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full w-fit">
                                                        <CheckCircle2 size={12} />
                                                        Completado
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-zinc-400 text-xs italic">
                                                {d.descripcion}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {canRevert(d) && (
                                                    <button
                                                        onClick={() => handleRevert(d._id)}
                                                        title="Revertir depósito (disponible 1 min)"
                                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
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
