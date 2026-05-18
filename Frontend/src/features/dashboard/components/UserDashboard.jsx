import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CreditCard,
    TrendingUp,
    Star,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    CalendarDays,
    PackageCheck,
    XCircle,
    ReceiptText,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../auth/store/authStore'
import useAccountStore from '../../accounts/store/accountStore'
import useTransactionStore from '../../transactions/store/transactionStore'
import useFavoriteStore from '../../favorites/store/favoriteStore'
import useProductStore from '../../products/store/productStore'
import TransactionForm from '../../transactions/components/TransactionForm'

const fmt = (n) =>
    new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
    }).format(Number(n || 0))

const dateFmt = (d) =>
    new Date(d).toLocaleDateString('es-GT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

const getId = (value) => {
    if (!value) return null
    if (typeof value === 'string') return value
    if (value._id) return String(value._id)
    if (value.id) return String(value.id)
    return String(value)
}

const getProductName = (acquisition) => {
    return (
        acquisition?.producto?.nombre ||
        acquisition?.producto?.name ||
        acquisition?.beneficio ||
        'Suscripción'
    )
}

const getNextChargeDate = (subscription) => {
    return subscription?.fechaProximoCobro || subscription?.createdAt || new Date()
}

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

        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">
            {label}
        </p>

        {loading ? (
            <div className="h-10 w-24 bg-zinc-800 rounded-xl animate-pulse mt-1" />
        ) : (
            <p className="text-white text-3xl font-black">{value}</p>
        )}
    </motion.div>
)

const UserDashboard = () => {
    const user = useAuthStore((s) => s.user)
    const [showTransferModal, setShowTransferModal] = useState(false)

    const { accounts, loading: loadingAccounts, fetchAccounts } = useAccountStore()

    const {
        transactions,
        loading: loadingTx,
        setCurrentAccountId,
        currentAccountId,
        fetchTransactions,
    } = useTransactionStore()

    const { favorites, fetchFavorites, loading: loadingFavorites } = useFavoriteStore()

    const {
        acquisitions,
        loading: loadingProducts,
        fetchMyProductAcquisitions,
        cancelSubscription,
    } = useProductStore()

    useEffect(() => {
        fetchAccounts()
        fetchFavorites()
        fetchMyProductAcquisitions()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (accounts.length > 0 && !currentAccountId) {
            setCurrentAccountId(accounts[0]._id || accounts[0].id)
        }
    }, [accounts, currentAccountId, setCurrentAccountId])

    const activeAccounts = useMemo(
        () => accounts.filter((a) => a.estado).length,
        [accounts]
    )

    const totalBalance = useMemo(
        () => accounts.reduce((sum, a) => sum + Number(a.saldo || 0), 0),
        [accounts]
    )

    const activeSubscriptions = useMemo(() => {
        return acquisitions.filter((item) => {
            const tipoOperacion = String(item?.tipoOperacion || '').toLowerCase()
            const tipoProducto = String(item?.producto?.tipo || '').toLowerCase()
            const estado = String(item?.estado || '').toLowerCase()

            return (
                estado === 'activa' &&
                (tipoOperacion === 'suscripcion' || tipoProducto === 'suscripcion')
            )
        })
    }, [acquisitions])

    const accountTypes = useMemo(() => {
        const types = [...new Set(accounts.map((a) => a.tipoCuenta).filter(Boolean))]

        return (
            types
                .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                .join(', ') || 'Sin cuentas'
        )
    }, [accounts])

    const transactionIds = useMemo(() => {
        return new Set(transactions.map((tx) => getId(tx._id || tx.id)))
    }, [transactions])

    const missingProductCharges = useMemo(() => {
        return acquisitions
            .filter((item) => {
                const tipoOperacion = String(item?.tipoOperacion || '').toLowerCase()
                const transaccionId = getId(item?.transaccion)

                const esCobro =
                    tipoOperacion === 'compra' ||
                    tipoOperacion === 'compra_cuotas' ||
                    tipoOperacion === 'suscripcion' ||
                    tipoOperacion === 'ahorro' ||
                    tipoOperacion === 'inversion'

                return esCobro && (!transaccionId || !transactionIds.has(transaccionId))
            })
            .map((item) => ({
                _id: `acquisition-${item._id || item.id}`,
                tipo: item.tipoOperacion === 'suscripcion' ? 'suscripcion' : 'compra',
                descripcion:
                    item.tipoOperacion === 'suscripcion'
                        ? `Cobro de suscripción: ${getProductName(item)}`
                        : `Cobro de producto: ${getProductName(item)}`,
                monto: Number(item.montoCobradoInicial || item.monto || 0),
                createdAt: item.createdAt,
                fecha: item.createdAt,
                esSalida: true,
                origenDashboard: 'adquisicion',
            }))
    }, [acquisitions, transactionIds])

    const recentActivity = useMemo(() => {
        const normalizedTransactions = transactions.map((tx) => {
            const cuentaOrigen = getId(tx.cuentaOrigen)
            const cuentaDestino = getId(tx.cuentaDestino)
            const cuentaActual = getId(currentAccountId)

            const tipo = String(tx.tipo || '').toLowerCase()

            const esSalida =
                tipo === 'compra' ||
                (tipo === 'transferencia' && cuentaOrigen && cuentaOrigen === cuentaActual)

            const esEntrada =
                tipo === 'deposito' ||
                tipo === 'credito' ||
                tipo === 'reversion' ||
                (tipo === 'transferencia' && cuentaDestino && cuentaDestino === cuentaActual)

            return {
                ...tx,
                esSalida: esSalida && !esEntrada,
                origenDashboard: 'transaccion',
            }
        })

        return [...normalizedTransactions, ...missingProductCharges]
            .sort(
                (a, b) =>
                    new Date(b.createdAt || b.fecha) -
                    new Date(a.createdAt || a.fecha)
            )
            .slice(0, 6)
    }, [transactions, missingProductCharges, currentAccountId])

    const handleCancelSubscription = async (subscription) => {
        const id = subscription._id || subscription.id
        const nombre = getProductName(subscription)

        const confirmed = window.confirm(
            `¿Desea cancelar la suscripción "${nombre}"?`
        )

        if (!confirmed) return

        const toastId = toast.loading('Cancelando suscripción...')

        try {
            await cancelSubscription(id, {
                motivoCancelacion: 'Cancelada por el cliente desde el dashboard',
            })

            await fetchMyProductAcquisitions()

            toast.success('Suscripción cancelada correctamente', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'No se pudo cancelar la suscripción',
                { id: toastId }
            )
        }
    }

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
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

                <StatCard
                    icon={ReceiptText}
                    label="Suscripciones Activas"
                    value={activeSubscriptions.length}
                    color="bg-indigo-600"
                    delay={0.3}
                    path="/products"
                    loading={loadingProducts}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8"
                >
                    <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                        <PackageCheck size={20} className="text-blue-400" />
                        Mis Productos
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">
                                Tipos de Cuenta
                            </p>
                            <p className="text-white font-semibold">{accountTypes}</p>
                        </div>

                        <div className="bg-white/5 h-px w-full" />

                        <div>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">
                                Suscripciones Activas
                            </p>

                            {loadingProducts ? (
                                <div className="space-y-3">
                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="h-20 bg-zinc-800/60 rounded-2xl animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : activeSubscriptions.length === 0 ? (
                                <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
                                    <p className="text-zinc-500 text-sm">
                                        No tiene suscripciones activas.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeSubscriptions.map((subscription) => (
                                        <div
                                            key={subscription._id || subscription.id}
                                            className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-white font-bold text-sm">
                                                        {getProductName(subscription)}
                                                    </p>

                                                    <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                                                        <CalendarDays size={13} />
                                                        Próximo cobro:{' '}
                                                        {dateFmt(getNextChargeDate(subscription))}
                                                    </p>

                                                    <p className="text-blue-400 text-sm font-black mt-2">
                                                        {fmt(
                                                            subscription.monto ||
                                                                subscription.totalEstimado ||
                                                                subscription.montoCobradoInicial
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCancelSubscription(subscription)
                                                    }
                                                    disabled={loadingProducts}
                                                    className="shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-60"
                                                >
                                                    <XCircle size={14} />
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <NavLink
                        to="/products"
                        className="mt-8 flex items-center justify-center w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-sm font-bold transition-all"
                    >
                        Ver Catálogo
                    </NavLink>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col"
                >
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                        <h2 className="text-white font-bold text-xl">
                            Actividad Reciente
                        </h2>

                        <button
                            type="button"
                            onClick={() => {
                                if (currentAccountId) fetchTransactions(currentAccountId)
                                fetchMyProductAcquisitions()
                            }}
                            className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
                        >
                            Actualizar
                        </button>
                    </div>

                    <div className="flex-1">
                        {loadingTx || loadingProducts ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-12 bg-zinc-800/50 rounded-2xl animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-zinc-500 text-sm">
                                    No se encontraron movimientos recientes.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {recentActivity.map((item, idx) => {
                                    const esSalida = item.esSalida
                                    const tipo = String(item.tipo || '').toLowerCase()

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + idx * 0.05 }}
                                            key={item._id || item.id}
                                            className="flex items-center justify-between px-8 py-5 hover:bg-white/2 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        esSalida
                                                            ? 'bg-red-500/10'
                                                            : 'bg-emerald-500/10'
                                                    }`}
                                                >
                                                    {esSalida ? (
                                                        <ArrowUpRight
                                                            size={18}
                                                            className="text-red-400"
                                                        />
                                                    ) : (
                                                        <ArrowDownLeft
                                                            size={18}
                                                            className="text-emerald-400"
                                                        />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-white font-bold text-sm capitalize">
                                                        {tipo === 'suscripcion'
                                                            ? 'Cobro de suscripción'
                                                            : tipo === 'compra'
                                                              ? 'Cobro de producto'
                                                              : tipo}
                                                    </p>

                                                    <p className="text-zinc-500 text-xs">
                                                        {item.descripcion ||
                                                            dateFmt(item.createdAt || item.fecha)}
                                                    </p>

                                                    <p className="text-zinc-600 text-[10px] mt-0.5">
                                                        {dateFmt(item.createdAt || item.fecha)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p
                                                    className={`font-black text-sm ${
                                                        esSalida
                                                            ? 'text-red-400'
                                                            : 'text-emerald-400'
                                                    }`}
                                                >
                                                    {esSalida ? '-' : '+'}
                                                    {fmt(item.monto)}
                                                </p>

                                                <p className="text-[10px] text-zinc-500 font-mono">
                                                    {item.numeroCuentaDestino ||
                                                        item.numeroCuentaOrigen ||
                                                        item.origenDashboard ||
                                                        'N/A'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {showTransferModal && (
                    <TransactionForm onClose={() => setShowTransferModal(false)} />
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserDashboard