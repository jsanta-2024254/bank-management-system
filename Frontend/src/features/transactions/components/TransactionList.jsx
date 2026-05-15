import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeftRight,
    Search,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronDown,
    Wallet,
} from 'lucide-react'
import useTransactionStore from '../store/transactionStore'
import useAccountStore from '../../accounts/store/accountStore'
import useAuthStore from '../../auth/store/authStore'
import TransactionForm from './TransactionForm'

const getUserRole = (user) =>
    user?.role || user?.Role || user?.roles?.[0] || user?.Roles?.[0] || 'USER_ROLE'

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
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [typeFilter, setTypeFilter] = useState('todas') // 'todas' | 'enviadas' | 'recibidas'

    useEffect(() => { fetchAccounts() }, [fetchAccounts])

    useEffect(() => {
        if (accounts.length > 0 && !currentAccountId) {
            setCurrentAccountId(accounts[0]._id || accounts[0].id || accounts[0].Id)
        }
    }, [accounts, currentAccountId, setCurrentAccountId])

    const handleCloseForm = () => {
        setShowForm(false)
        fetchTransactions()
    }

    const selectedAccount = accounts.find(
        (a) => (a._id || a.id || a.Id) === currentAccountId
    )

    const filtered = (transactions || []).filter((t) => {
        // búsqueda por texto
        const q = search.toLowerCase()
        const matchSearch =
            (t.tipo || '').toLowerCase().includes(q) ||
            (t.descripcion || '').toLowerCase().includes(q) ||
            (t.numeroCuentaDestino || '').toLowerCase().includes(q) ||
            (t.cuentaDestino?.numeroCuenta || '').toLowerCase().includes(q)

        // filtro de fecha
        const txDate = new Date(t.createdAt || t.fecha)
        const matchFrom = dateFrom ? txDate >= new Date(dateFrom) : true
        const matchTo = dateTo ? txDate <= new Date(dateTo + 'T23:59:59') : true

        // filtro de tipo: enviadas = la cuenta activa es origen; recibidas = la cuenta activa es destino
        let matchType = true
        if (typeFilter === 'enviadas') {
            const fromId = t.fromAccount || t.cuentaOrigen?._id || t.cuentaOrigen
            matchType = fromId === currentAccountId
        } else if (typeFilter === 'recibidas') {
            const toId = t.toAccount || t.cuentaDestino?._id || t.cuentaDestino
            matchType = toId === currentAccountId
        }

        return matchSearch && matchFrom && matchTo && matchType
    })

    const fmt = (n) =>
        new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n || 0)

    const dateFmt = (d) =>
        d
            ? new Date(d).toLocaleDateString('es-GT', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            })
            : '—'

    const Skeleton = ({ className }) => (
        <div className={`bg-zinc-800 animate-pulse ${className}`} />
    )

    const typeButtons = [
        { key: 'todas', label: 'Todas' },
        { key: 'enviadas', label: 'Enviadas' },
        { key: 'recibidas', label: 'Recibidas' },
    ]

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
            {showForm && esCliente && <TransactionForm onClose={handleCloseForm} />}

            {/* Header */}
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

            {/* Fila 1: Selector de cuenta + badge saldo */}
            <div className="mb-4">
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">
                    Cuenta a consultar
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative flex-1">
                        <select
                            value={currentAccountId || ''}
                            onChange={(e) => setCurrentAccountId(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm appearance-none"
                        >
                            {accounts.map((acc) => (
                                <option key={acc._id || acc.id || acc.Id} value={acc._id || acc.id || acc.Id}>
                                    {acc.numeroCuenta} — {acc.tipoCuenta}
                                </option>
                            ))}
                            {accounts.length === 0 && (
                                <option value="" disabled>No hay cuentas disponibles</option>
                            )}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>

                    {selectedAccount && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap">
                            <Wallet size={14} />
                            Saldo: {fmt(selectedAccount.saldo)}
                        </div>
                    )}
                </div>
            </div>

            {/* Fila 2: Filtros de fecha + búsqueda */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">
                        Desde
                    </label>
                    <div className="relative">
                        <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm [color-scheme:dark]"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">
                        Hasta
                    </label>
                    <div className="relative">
                        <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm [color-scheme:dark]"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">
                        Buscar
                    </label>
                    <div className="relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tipo, descripción o cuenta..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Fila 3: Botones toggle tipo */}
            <div className="flex gap-2 mb-6">
                {typeButtons.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTypeFilter(key)}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${typeFilter === key
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                            }`}
                    >
                        {label}
                    </button>
                ))}
                <span className="ml-auto text-zinc-600 text-xs self-center">
                    {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 text-center">
                    {error}
                </div>
            )}

            {/* Tabla */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Tipo</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Monto</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Origen / Destino</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Fecha</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Descripción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && filtered.length === 0 ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5"><Skeleton className="h-10 w-40 rounded-xl" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-5 w-28 rounded-lg" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-10 w-44 rounded-xl" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-5 w-32 rounded-lg" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-5 w-48 rounded-lg" /></td>
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
                                        const fromId = t.fromAccount || t.cuentaOrigen?._id || t.cuentaOrigen
                                        const isEnviada = fromId === currentAccountId
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
                                                        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${isEnviada
                                                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                                : isTransfer
                                                                    ? 'bg-blue-600/10 border-blue-600/20 text-blue-400'
                                                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                            }`}>
                                                            {isEnviada
                                                                ? <ArrowUpRight size={16} />
                                                                : <ArrowDownLeft size={16} />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-semibold text-sm capitalize">
                                                                {t.tipo || 'Movimiento'}
                                                            </span>
                                                            <span className={`text-[10px] font-bold ${isEnviada ? 'text-red-400' : 'text-emerald-400'}`}>
                                                                {isEnviada ? 'Enviada' : 'Recibida'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <span className={`font-semibold text-sm ${isEnviada ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {isEnviada ? '−' : '+'}{fmt(t.monto)}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-0.5">
                                                        {(t.cuentaOrigen?.numeroCuenta || t.numeroCuentaOrigen) && (
                                                            <div>
                                                                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Origen </span>
                                                                <span className="text-zinc-300 font-mono text-xs">
                                                                    {t.cuentaOrigen?.numeroCuenta || t.numeroCuentaOrigen}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Destino </span>
                                                            <span className="text-zinc-300 font-mono text-xs">
                                                                {t.cuentaDestino?.numeroCuenta || t.numeroCuentaDestino || 'N/A'}
                                                            </span>
                                                        </div>
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