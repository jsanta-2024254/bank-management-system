import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, Search, Calendar, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import useTransactionStore from '../store/transactionStore'
import useAccountStore from '../../accounts/store/accountStore'
import TransactionForm from './TransactionForm'

const TransactionList = () => {
    const { transactions, loading, error, setCurrentAccountId, currentAccountId, fetchTransactions } = useTransactionStore()
    const { accounts, fetchAccounts } = useAccountStore()
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchAccounts()
    }, [fetchAccounts])

    useEffect(() => {
        if (accounts.length > 0 && !currentAccountId) {
            setCurrentAccountId(accounts[0]._id)
        }
    }, [accounts, currentAccountId, setCurrentAccountId])

    const filtered = transactions.filter((t) => {
        const q = search.toLowerCase()
        return (
            (t.tipo || '').toLowerCase().includes(q) ||
            (t.descripcion || '').toLowerCase().includes(q) ||
            (t.numeroCuentaDestino || '').toLowerCase().includes(q)
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

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
            {showForm && (
                <TransactionForm
                    onClose={() => {
                        setShowForm(false)
                        fetchTransactions()
                    }}
                />
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Transacciones</h1>
                    <p className="text-zinc-500 text-sm mt-1">Historial de movimientos y transferencias.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                    <ArrowLeftRight size={18} />
                    Nueva Transferencia
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">Cuenta a consultar</label>
                    <select 
                        value={currentAccountId || ''} 
                        onChange={(e) => setCurrentAccountId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm appearance-none"
                    >
                        {accounts.map(acc => (
                            <option key={acc._id} value={acc._id}>
                                {acc.numeroCuenta} - {acc.tipoCuenta} ({fmt(acc.saldo)})
                            </option>
                        ))}
                        {accounts.length === 0 && <option disabled>No hay cuentas disponibles</option>}
                    </select>
                </div>

                <div className="relative flex flex-col justify-end">
                    <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">Buscar</label>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por tipo o descripción..."
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
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Tipo</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Monto</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Origen/Destino</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Fecha</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Descripción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((t) => (
                                <tr key={t._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                t.tipo === 'transferencia' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                                {t.tipo === 'transferencia' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                            </div>
                                            <span className="text-white font-bold text-sm capitalize">{t.tipo}</span>
                                        </div>
                                    </td>
                                    <td className={`px-8 py-5 font-bold text-sm ${
                                        t.tipo === 'transferencia' ? 'text-white' : 'text-emerald-400'
                                    }`}>
                                        {fmt(t.monto)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-tighter">Cuenta Destino</span>
                                            <span className="text-white font-mono text-xs">
                                                {t.cuentaDestino?.numeroCuenta || t.numeroCuentaDestino || 'N/A'}
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
                                </tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-600">
                                                <ArrowLeftRight size={24} />
                                            </div>
                                            <p className="text-zinc-500 text-sm">No se encontraron transacciones.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 text-sm">Cargando transacciones...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}

export default TransactionList
