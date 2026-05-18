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
        className="group relative overflow-hidden rounded-[1.75rem] border border-[#d7bc73]/45 bg-[#fffaf0]/70 p-6 shadow-[0_20px_55px_rgba(92,64,19,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#b98219]/55 hover:bg-white/78 hover:shadow-[0_26px_70px_rgba(92,64,19,0.16)]"
    >
        <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#d9b45e]/16 blur-2xl transition-all duration-300 group-hover:bg-[#d9b45e]/25" />
        <div className="premium-gold-line absolute left-6 right-6 top-0 h-px" />

        <div className="relative mb-5 flex items-start justify-between">
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7bc73]/45 shadow-[0_14px_28px_rgba(154,107,22,0.18)] ${color}`}
            >
                <Icon size={22} className="text-[#4a2f0c]" />
            </div>

            {path && (
                <NavLink
                    to={path}
                    className="rounded-full border border-[#d7bc73]/40 bg-white/52 px-3 py-1 text-xs font-black text-[#8a611b] transition-all hover:border-[#b98219]/60 hover:bg-[#fff8df] hover:text-[#3f2c12]"
                >
                    Ver →
                </NavLink>
            )}
        </div>

        <p className="relative mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/72">
            {label}
        </p>

        {loading ? (
            <div className="relative mt-2 h-10 w-24 animate-pulse rounded-xl bg-[#ead9ad]/65" />
        ) : (
            <p className="relative text-3xl font-black tracking-tight text-[#3f2c12]">
                {value}
            </p>
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
            <div className="mb-8">
                <div className="relative overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                    <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[#d9b45e]/18 blur-3xl" />
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="relative">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                                    <span className="text-2xl font-black uppercase text-[#4a2f0c]">
                                        {user?.nombre?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                    </span>
                                </div>

                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-[#fff8ea] bg-emerald-600 shadow-[0_6px_16px_rgba(5,150,105,0.25)]" />
                            </div>

                            <div>
                                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                    Banca personal
                                </p>

                                <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                    Bienvenido, {user?.nombre || user?.username || 'Usuario'}
                                </h1>

                                <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                    Qué gusto verte de nuevo.
                                </p>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowTransferModal(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] md:self-center"
                        >
                            <Plus size={19} />
                            Nueva Transferencia
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={CreditCard}
                    label="Cuentas Activas"
                    value={activeAccounts}
                    color="bg-gradient-to-br from-[#fff1bd] via-[#d9b45e] to-[#b98219]"
                    delay={0}
                    path="/accounts"
                    loading={loadingAccounts}
                />

                <StatCard
                    icon={TrendingUp}
                    label="Saldo Consolidado"
                    value={fmt(totalBalance)}
                    color="bg-gradient-to-br from-[#f7e7b1] via-[#c89b3c] to-[#8a611b]"
                    delay={0.1}
                    loading={loadingAccounts}
                />

                <StatCard
                    icon={Star}
                    label="Favoritos Guardados"
                    value={favorites.length}
                    color="bg-gradient-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16]"
                    delay={0.2}
                    path="/favorites"
                    loading={loadingFavorites}
                />

                <StatCard
                    icon={ReceiptText}
                    label="Suscripciones Activas"
                    value={activeSubscriptions.length}
                    color="bg-gradient-to-br from-[#f5df9b] via-[#c89b3c] to-[#7a4f0d]"
                    delay={0.3}
                    path="/products"
                    loading={loadingProducts}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 p-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:p-8"
                >
                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#d9b45e]/16 blur-3xl" />
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <div className="relative mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                            <PackageCheck size={20} />
                        </div>

                        <div>
                            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                Resumen personal
                            </p>

                            <h2 className="text-xl font-black text-[#3f2c12]">
                                Mis Productos
                            </h2>
                        </div>
                    </div>

                    <div className="relative space-y-6">
                        <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                Tipos de Cuenta
                            </p>

                            <p className="font-bold text-[#3f2c12]">{accountTypes}</p>
                        </div>

                        <div className="h-px w-full bg-[#d7bc73]/35" />

                        <div>
                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                Suscripciones Activas
                            </p>

                            {loadingProducts ? (
                                <div className="space-y-3">
                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="h-24 animate-pulse rounded-2xl bg-[#ead9ad]/60"
                                        />
                                    ))}
                                </div>
                            ) : activeSubscriptions.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#d7bc73]/45 bg-white/35 p-4">
                                    <p className="text-sm font-semibold text-[#8a6a3a]">
                                        No tiene suscripciones activas.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeSubscriptions.map((subscription) => (
                                        <div
                                            key={subscription._id || subscription.id}
                                            className="rounded-2xl border border-[#d7bc73]/40 bg-white/42 p-4 shadow-[0_12px_28px_rgba(92,64,19,0.08)]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-black text-[#3f2c12]">
                                                        {getProductName(subscription)}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#8a6a3a]">
                                                        <CalendarDays size={13} />
                                                        Próximo cobro:{' '}
                                                        {dateFmt(getNextChargeDate(subscription))}
                                                    </p>

                                                    <p className="mt-2 text-sm font-black text-[#8a611b]">
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
                                                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-xs font-black text-red-700 transition-all hover:bg-red-100 disabled:opacity-60"
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
                        className="relative mt-8 flex w-full items-center justify-center rounded-2xl border border-[#d7bc73]/50 bg-white/55 py-4 text-sm font-black text-[#6f4d13] shadow-[0_12px_26px_rgba(92,64,19,0.08)] transition-all hover:border-[#b98219]/60 hover:bg-[#fff8df] hover:text-[#3f2c12]"
                    >
                        Ver Catálogo
                    </NavLink>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative flex flex-col overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl lg:col-span-2"
                >
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <div className="flex items-center justify-between border-b border-[#d7bc73]/35 px-6 py-5 md:px-8">
                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                Movimientos recientes
                            </p>

                            <h2 className="text-xl font-black text-[#3f2c12]">
                                Actividad Reciente
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (currentAccountId) fetchTransactions(currentAccountId)
                                fetchMyProductAcquisitions()
                            }}
                            className="rounded-full border border-[#d7bc73]/40 bg-white/52 px-4 py-2 text-sm font-black text-[#8a611b] transition-all hover:border-[#b98219]/60 hover:bg-[#fff8df] hover:text-[#3f2c12]"
                        >
                            Actualizar
                        </button>
                    </div>

                    <div className="flex-1">
                        {loadingTx || loadingProducts ? (
                            <div className="space-y-4 p-8">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-14 animate-pulse rounded-2xl bg-[#ead9ad]/60"
                                    />
                                ))}
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-sm font-semibold text-[#8a6a3a]">
                                    No se encontraron movimientos recientes.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#d7bc73]/28">
                                {recentActivity.map((item, idx) => {
                                    const esSalida = item.esSalida
                                    const tipo = String(item.tipo || '').toLowerCase()

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + idx * 0.05 }}
                                            key={item._id || item.id}
                                            className="flex items-center justify-between gap-5 px-6 py-5 transition-colors hover:bg-white/32 md:px-8"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${esSalida
                                                            ? 'border-red-200 bg-red-50 text-red-700'
                                                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        }`}
                                                >
                                                    {esSalida ? (
                                                        <ArrowUpRight size={18} />
                                                    ) : (
                                                        <ArrowDownLeft size={18} />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-black capitalize text-[#3f2c12]">
                                                        {tipo === 'suscripcion'
                                                            ? 'Cobro de suscripción'
                                                            : tipo === 'compra'
                                                                ? 'Cobro de producto'
                                                                : tipo}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-xs font-semibold text-[#8a6a3a]">
                                                        {item.descripcion ||
                                                            dateFmt(item.createdAt || item.fecha)}
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] font-semibold text-[#a89365]">
                                                        {dateFmt(item.createdAt || item.fecha)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p
                                                    className={`text-sm font-black ${esSalida
                                                            ? 'text-red-700'
                                                            : 'text-emerald-700'
                                                        }`}
                                                >
                                                    {esSalida ? '-' : '+'}
                                                    {fmt(item.monto)}
                                                </p>

                                                <p className="mt-1 font-mono text-[10px] font-semibold text-[#9a8a6c]">
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