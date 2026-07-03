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
    const [typeFilter, setTypeFilter] = useState('todas')

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
        const q = search.toLowerCase()
        const matchSearch =
            (t.tipo || '').toLowerCase().includes(q) ||
            (t.descripcion || '').toLowerCase().includes(q) ||
            (t.numeroCuentaDestino || '').toLowerCase().includes(q) ||
            (t.cuentaDestino?.numeroCuenta || '').toLowerCase().includes(q)

        const txDate = new Date(t.createdAt || t.fecha)
        const matchFrom = dateFrom ? txDate >= new Date(dateFrom) : true
        const matchTo = dateTo ? txDate <= new Date(dateTo + 'T23:59:59') : true

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
        <div className={`animate-pulse bg-[#ead9ad]/70 ${className}`} />
    )

    const typeButtons = [
        { key: 'todas', label: 'Todas' },
        { key: 'enviadas', label: 'Enviadas' },
        { key: 'recibidas', label: 'Recibidas' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
        >
            {showForm && esCliente && <TransactionForm onClose={handleCloseForm} />}

            <div className="mb-8 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                <div className="premium-gold-line mb-6 h-px w-full" />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                            <ArrowLeftRight size={28} className="text-[#5b3a0d]" />
                        </div>

                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                Movimientos bancarios
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                Transacciones
                            </h1>

                            <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                Historial de movimientos y transferencias.
                            </p>
                        </div>
                    </div>

                    {esCliente && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] active:scale-95 sm:w-auto"
                        >
                            <ArrowLeftRight size={18} />
                            Nueva Transferencia
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-5 rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 p-5 shadow-[0_18px_48px_rgba(92,64,19,0.08)] backdrop-blur-xl">
                <label className="mb-3 ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75">
                    Cuenta a consultar
                </label>

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <select
                            value={currentAccountId || ''}
                            onChange={(e) => setCurrentAccountId(e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-4 py-3.5 text-sm font-semibold text-[#3b2a14] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
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

                        <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                        />
                    </div>

                    {selectedAccount && (
                        <div className="flex items-center gap-2 whitespace-nowrap rounded-2xl border border-emerald-200 bg-emerald-50/85 px-4 py-3 text-sm font-black text-emerald-700 shadow-[0_12px_26px_rgba(5,150,105,0.08)]">
                            <Wallet size={14} />
                            Saldo: {fmt(selectedAccount.saldo)}
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label className="mb-3 ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75">
                        Desde
                    </label>

                    <div className="relative">
                        <Calendar
                            size={14}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                        />

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-3.5 pl-10 pr-4 text-sm font-semibold text-[#3b2a14] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all scheme-light focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-3 ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75">
                        Hasta
                    </label>

                    <div className="relative">
                        <Calendar
                            size={14}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                        />

                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-3.5 pl-10 pr-4 text-sm font-semibold text-[#3b2a14] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all scheme-light focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-3 ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75">
                        Buscar
                    </label>

                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tipo, descripción o cuenta..."
                            className="w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-3.5 pl-10 pr-4 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
                {typeButtons.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTypeFilter(key)}
                        className={`rounded-xl px-5 py-2 text-sm font-black transition-all ${typeFilter === key
                                ? 'border border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] text-white shadow-[0_14px_28px_rgba(154,107,22,0.22)]'
                                : 'border border-[#d7bc73]/45 bg-white/45 text-[#6f5a33] hover:bg-white/85 hover:text-[#3f2c12]'
                            }`}
                    >
                        {label}
                    </button>
                ))}

                <span className="ml-auto text-xs font-bold text-[#8a6a3a]">
                    {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                </span>
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
                                    Tipo
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Monto
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Origen / Destino
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Fecha
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Descripción
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#d7bc73]/28">
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
                                    <td colSpan={5} className="px-8 py-16 text-center text-[#8a6a3a]">
                                        <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-40" />
                                        <p className="font-bold">No se encontraron transacciones</p>
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
                                                className="transition-colors hover:bg-white/35"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${isEnviada
                                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                                : isTransfer
                                                                    ? 'border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b]'
                                                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            }`}>
                                                            {isEnviada
                                                                ? <ArrowUpRight size={16} />
                                                                : <ArrowDownLeft size={16} />}
                                                        </div>

                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black capitalize text-[#3f2c12]">
                                                                {t.tipo || 'Movimiento'}
                                                            </span>

                                                            <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${isEnviada ? 'text-red-700' : 'text-emerald-700'
                                                                }`}>
                                                                {isEnviada ? 'Enviada' : 'Recibida'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <span className={`text-sm font-black ${isEnviada ? 'text-red-700' : 'text-emerald-700'
                                                        }`}>
                                                        {isEnviada ? '−' : '+'}{fmt(t.monto)}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        {(t.cuentaOrigen?.numeroCuenta || t.numeroCuentaOrigen) && (
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/65">
                                                                    Origen{' '}
                                                                </span>

                                                                <span className="font-mono text-xs font-semibold text-[#7a6849]">
                                                                    {t.cuentaOrigen?.numeroCuenta || t.numeroCuentaOrigen}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a611b]/65">
                                                                Destino{' '}
                                                            </span>

                                                            <span className="font-mono text-xs font-semibold text-[#7a6849]">
                                                                {t.cuentaDestino?.numeroCuenta || t.numeroCuentaDestino || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8a6a3a]">
                                                        <Calendar size={12} />
                                                        {dateFmt(t.createdAt || t.fecha)}
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 text-xs font-semibold italic text-[#8a6a3a]">
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