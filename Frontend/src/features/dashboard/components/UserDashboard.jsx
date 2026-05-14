import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CreditCard,
    TrendingUp,
    Star,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useAuthStore from '../../auth/store/authStore'
import useAccountStore from '../../accounts/store/accountStore'
import useTransactionStore from '../../transactions/store/transactionStore'
import useFavoriteStore from '../../favorites/store/favoriteStore'
import TransactionForm from '../../transactions/components/TransactionForm'

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
    new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
    }).format(n)

const dateFmt = (d) =>
    new Date(d).toLocaleDateString('es-GT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

// ─── Stat Card ──────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, path, delay, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all shadow-xl shadow-black/20"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={22} className="text-white" />
            </div>
            {path && (
                <NavLink
                    to={path}
                    className="text-xs text-zinc-500 hover:text-blue-400 transition-colors font-semibold bg-white/5 px-3 py-1 rounded-full"
                >
                    Ver →
                </NavLink>
            )}
        </div>
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        {loading ? (
            <div className="h-10 w-24 bg-zinc-800 rounded-xl animate-pulse mt-1" />
        ) : (
            <p className="text-white text-3xl font-black">{value}</p>
        )}
    </motion.div>
)

// ─── User Dashboard ─────────────────────────────────────────────────────────

const UserDashboard = () => {
    const user = useAuthStore((s) => s.user)
    const [showTransferModal, setShowTransferModal] = useState(false)

    const { accounts, loading: loadingAccounts, fetchAccounts } = useAccountStore()
    const {
        transactions,
        loading: loadingTx,
        setCurrentAccountId,
        currentAccountId,
    } = useTransactionStore()
    const { favorites, fetchFavorites, loading: loadingFavorites } = useFavoriteStore()

    // Fetch data on mount
    useEffect(() => {
        fetchAccounts()
        fetchFavorites()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Set first account as default for transactions
    useEffect(() => {
        if (accounts.length > 0 && !currentAccountId) {
            setCurrentAccountId(accounts[0]._id)
        }
    }, [accounts, currentAccountId, setCurrentAccountId])

    // ── Derived stats ──────────────────────────────────────────────────────
    const activeAccounts = useMemo(() => accounts.filter((a) => a.estado).length, [accounts])

    const totalBalance = useMemo(
        () => accounts.reduce((sum, a) => sum + (a.saldo || 0), 0),
        [accounts]
    )

    const accountTypes = useMemo(() => {
        const types = [...new Set(accounts.map((a) => a.tipoCuenta))]
        return types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') || 'Sin cuentas'
    }, [accounts])

    // Last 5 transactions
    const recentTransactions = useMemo(
        () =>
            [...transactions]
                .sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha))
                .slice(0, 5),
        [transactions]
    )

    return (
        <div className="pb-10">
            {/* Header with Welcome and Quick Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <span className="text-white text-2xl font-black uppercase">
                                {user?.nombre?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-zinc-950 rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">
                            Bienvenido, {user?.nombre || user?.username || 'Usuario'}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-0.5">
                            Qué gusto verte de nuevo.
                        </p>
                    </div>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTransferModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus size={20} />
                    Nueva Transferencia
                </motion.button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    icon={CreditCard}
                    label="Cuentas Activas"
                    value={activeAccounts}
                    color="bg-blue-600"
                    delay={0}
                    path="/accounts"
                    loading={loadingAccounts}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Saldo Consolidado"
                    value={fmt(totalBalance)}
                    color="bg-emerald-600"
                    delay={0.1}
                    loading={loadingAccounts}
                />
                <StatCard
                    icon={Star}
                    label="Favoritos Guardados"
                    value={favorites.length}
                    color="bg-amber-500"
                    delay={0.2}
                    path="/favorites"
                    loading={loadingFavorites}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8"
                >
                    <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                        Mis Productos
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Tipos de Cuenta</p>
                            <p className="text-white font-semibold">{accountTypes}</p>
                        </div>
                        
                        <div className="bg-white/5 h-px w-full" />
                        
                        <div>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Estado General</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-emerald-400 font-bold text-sm">Operativo</p>
                            </div>
                        </div>
                    </div>

                    <NavLink 
                        to="/accounts"
                        className="mt-8 flex items-center justify-center w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-sm font-bold transition-all"
                    >
                        Gestionar Cuentas
                    </NavLink>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col"
                >
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                        <h2 className="text-white font-bold text-xl">Actividad Reciente</h2>
                        <NavLink
                            to="/transactions"
                            className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
                        >
                            Ver historial →
                        </NavLink>
                    </div>

                    <div className="flex-1">
                        {loadingTx ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-zinc-800/50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-zinc-500 text-sm">No se encontraron transacciones recientes.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {recentTransactions.map((tx, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + idx * 0.05 }}
                                        key={tx._id}
                                        className="flex items-center justify-between px-8 py-5 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                tx.tipo === 'transferencia' ? 'bg-zinc-800' : 'bg-emerald-500/10'
                                            }`}>
                                                {tx.tipo === 'transferencia' ? (
                                                    <ArrowUpRight size={18} className="text-white" />
                                                ) : (
                                                    <ArrowDownLeft size={18} className="text-emerald-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm capitalize">{tx.tipo}</p>
                                                <p className="text-zinc-500 text-xs">{dateFmt(tx.createdAt || tx.fecha)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black text-sm ${
                                                tx.tipo === 'transferencia' ? 'text-white' : 'text-emerald-400'
                                            }`}>
                                                {tx.tipo === 'transferencia' ? '-' : '+'}{fmt(tx.monto)}
                                            </p>
                                            <p className="text-[10px] text-zinc-500 font-mono">{tx.numeroCuentaDestino || 'N/A'}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Modal for Transfer */}
            <AnimatePresence>
                {showTransferModal && (
                    <TransactionForm onClose={() => setShowTransferModal(false)} />
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserDashboard
