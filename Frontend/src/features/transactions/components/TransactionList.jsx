import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeftRight,
    Search,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
} from 'lucide-react'
import useTransactionStore from '../store/transactionStore'
import useAccountStore from '../../accounts/store/accountStore'
import useAuthStore from '../../auth/store/authStore'
import TransactionForm from './TransactionForm'

const getUserRole = (user) => {
    return (
        user?.role ||
        user?.Role ||
        user?.roles?.[0] ||
        user?.Roles?.[0] ||
        'USER_ROLE'
    )
}

const TransactionList = () => {
    const user = useAuthStore((state) => state.user)
    const role = getUserRole(user)
    const esCliente = role === 'USER_ROLE'

    const {
        transactions,
        loading,
        error,
        setCurrentAccountId,
        currentAccountId,
        fetchTransactions,
    } = useTransactionStore()

    const { accounts, fetchAccounts } = useAccountStore()

    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchAccounts()
    }, [fetchAccounts])

    useEffect(() => {
        if (accounts.length > 0 && !currentAccountId) {
            setCurrentAccountId(accounts[0]._id || accounts[0].id || accounts[0].Id)
        }
    }, [accounts, currentAccountId, setCurrentAccountId])

    const handleCloseForm = () => {
        setShowForm(false)
        fetchTransactions()
    }

    const filtered = (transactions || []).filter((t) => {
        const q = search.toLowerCase()

        return (
            (t.tipo || '').toLowerCase().includes(q) ||
            (t.descripcion || '').toLowerCase().includes(q) ||
            (t.numeroCuentaDestino || '').toLowerCase().includes(q) ||
            (t.cuentaDestino?.numeroCuenta || '').toLowerCase().includes(q)
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

    const Skeleton = ({ className }) => (
        <div className={`bg-zinc-800 animate-pulse ${className}`} />
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
        >
            {showForm && esCliente && <TransactionForm onClose={handleCloseForm} />}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Transacciones</h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Historial de movimientos y transferencias.
                    </p>
                </div>

                {esCliente && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                        <ArrowLeftRight size={18} />
                        Nueva Transferencia
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">
                        Cuenta a consultar
                    </label>
                    <select
                        value={currentAccountId || ''}
                        onChange={(e) => setCurrentAccountId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm appearance-none"
                    >
                        {accounts.map((acc) => (
                            <option key={acc._id || acc.id || acc.Id} value={acc._id || acc.id || acc.Id}>
                                {acc.numeroCuenta} - {acc.tipoCuenta} ({fmt(acc.saldo)})
                            </option>
                        ))}

                        {accounts.length === 0 && (
                            <option value="" disabled>
                                No hay cuentas disponibles
                            </option>
                        )}
                    </select>
                </div>

                <div className="relative flex flex-col justify-end">
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">
                        Buscar
                    </label>
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por tipo, descripción o cuenta..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                        />
                    </div>
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
                                    Tipo
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Monto
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Origen/Destino
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Fecha
                                </th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">
                                    Descripción
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                            {loading && filtered.length === 0 ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5">
                                            <Skeleton className="h-10 w-40 rounded-xl" />
                                        </td>
                                        <td className="px-8 py-5">
                                            <Skeleton className="h-5 w-28 rounded-lg" />
                                        </td>
                                        <td className="px-8 py-5">
                                            <Skeleton className="h-10 w-44 rounded-xl" />
                                        </td>
                                        <td className="px-8 py-5">
                                            <Skeleton className="h-5 w-32 rounded-lg" />
                                        </td>
                                        <td className="px-8 py-5">
                                            <Skeleton className="h-5 w-48 rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-zinc-500">
                                        <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No se encontraron transacciones</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filtered.map((t) => {
                                        const isTransfer = t.tipo === 'transferencia'

                                        return (
                                            <motion.tr
                                                key={t._id || t.id || t.Id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-white/3 transition-colors"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                                                                isTransfer
                                                                    ? 'bg-blue-600/10 border-blue-600/20 text-blue-400'
                                                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                            }`}
                                                        >
                                                            {isTransfer ? (
                                                                <ArrowUpRight size={16} />
                                                            ) : (
                                                                <ArrowDownLeft size={16} />
                                                            )}
                                                        </div>
                                                        <span className="text-white font-semibold text-sm capitalize">
                                                            {t.tipo || 'Movimiento'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 text-white font-semibold text-sm">
                                                    {fmt(t.monto)}
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">
                                                            Cuenta Destino
                                                        </span>
                                                        <span className="text-white font-mono text-xs">
                                                            {t.cuentaDestino?.numeroCuenta ||
                                                                t.numeroCuentaDestino ||
                                                                'N/A'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                                        <Calendar size={12} />
                                                        {dateFmt(t.createdAt || t.fecha)}
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 text-zinc-500 text-xs italic">
                                                    {t.descripcion || 'Sin descripción'}
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

export default TransactionList