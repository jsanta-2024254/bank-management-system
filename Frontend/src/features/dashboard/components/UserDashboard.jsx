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
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(Number(n || 0))

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

const getProductName = (acquisition) =>
    acquisition?.producto?.nombre ||
    acquisition?.producto?.name ||
    acquisition?.beneficio ||
    'Suscripción'

const getNextChargeDate = (subscription) =>
    subscription?.fechaProximoCobro || subscription?.createdAt || new Date()

const coloresCard = [
    { fondo: 'rgba(184,137,42,0.12)', borde: 'rgba(184,137,42,0.28)', icono: '#b8892a' },
    { fondo: 'rgba(45,122,79,0.12)',  borde: 'rgba(45,122,79,0.28)',  icono: '#5cb87a' },
    { fondo: 'rgba(180,140,30,0.12)', borde: 'rgba(180,140,30,0.28)', icono: '#d4a843' },
    { fondo: 'rgba(100,70,140,0.12)', borde: 'rgba(130,90,180,0.25)', icono: '#a07ac8' },
]

const StatCard = ({ icon: Icon, label, value, colorIdx = 0, path, delay, loading }) => {
    const c = coloresCard[colorIdx] || coloresCard[0]
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{
                backgroundColor: '#1a1208',
                border: '1px solid var(--borde-card)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(184,137,42,0.40)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(184,137,42,0.08)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--borde-card)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: c.fondo, border: `1px solid ${c.borde}` }}
                >
                    <Icon size={18} style={{ color: c.icono }} />
                </div>
                {path && (
                    <NavLink
                        to={path}
                        className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                        style={{ color: 'var(--texto-tenue)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                    >
                        Ver →
                    </NavLink>
                )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--texto-tenue)' }}>
                {label}
            </p>
            {loading ? (
                <div className="h-8 w-20 rounded-lg animate-pulse mt-1" style={{ backgroundColor: 'rgba(184,137,42,0.08)' }} />
            ) : (
                <p className="text-3xl font-black" style={{ color: 'var(--texto-blanco)', fontFamily: 'var(--font-body)' }}>
                    {value}
                </p>
            )}
        </motion.div>
    )
}

const UserDashboard = () => {
    const user = useAuthStore((s) => s.user)
    const [showTransferModal, setShowTransferModal] = useState(false)

    const { accounts, loading: loadingAccounts, fetchAccounts } = useAccountStore()
    const { transactions, loading: loadingTx, setCurrentAccountId, currentAccountId, fetchTransactions } = useTransactionStore()
    const { favorites, fetchFavorites, loading: loadingFavorites } = useFavoriteStore()
    const { acquisitions, loading: loadingProducts, fetchMyProductAcquisitions, cancelSubscription } = useProductStore()

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

    const activeAccounts = useMemo(() => accounts.filter((a) => a.estado).length, [accounts])
    const totalBalance = useMemo(() => accounts.reduce((sum, a) => sum + Number(a.saldo || 0), 0), [accounts])

    const activeSubscriptions = useMemo(() =>
        acquisitions.filter((item) => {
            const tipoOperacion = String(item?.tipoOperacion || '').toLowerCase()
            const tipoProducto = String(item?.producto?.tipo || '').toLowerCase()
            const estado = String(item?.estado || '').toLowerCase()
            return estado === 'activa' && (tipoOperacion === 'suscripcion' || tipoProducto === 'suscripcion')
        }), [acquisitions])

    const accountTypes = useMemo(() => {
        const types = [...new Set(accounts.map((a) => a.tipoCuenta).filter(Boolean))]
        return types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') || 'Sin cuentas'
    }, [accounts])

    const transactionIds = useMemo(() => new Set(transactions.map((tx) => getId(tx._id || tx.id))), [transactions])

    const missingProductCharges = useMemo(() =>
        acquisitions
            .filter((item) => {
                const tipoOperacion = String(item?.tipoOperacion || '').toLowerCase()
                const transaccionId = getId(item?.transaccion)
                const esCobro = ['compra', 'compra_cuotas', 'suscripcion', 'ahorro', 'inversion'].includes(tipoOperacion)
                return esCobro && (!transaccionId || !transactionIds.has(transaccionId))
            })
            .map((item) => ({
                _id: `acquisition-${item._id || item.id}`,
                tipo: item.tipoOperacion === 'suscripcion' ? 'suscripcion' : 'compra',
                descripcion: item.tipoOperacion === 'suscripcion'
                    ? `Cobro de suscripción: ${getProductName(item)}`
                    : `Cobro de producto: ${getProductName(item)}`,
                monto: Number(item.montoCobradoInicial || item.monto || 0),
                createdAt: item.createdAt,
                fecha: item.createdAt,
                esSalida: true,
                origenDashboard: 'adquisicion',
            })), [acquisitions, transactionIds])

    const recentActivity = useMemo(() => {
        const normalizedTransactions = transactions.map((tx) => {
            const cuentaOrigen = getId(tx.cuentaOrigen)
            const cuentaDestino = getId(tx.cuentaDestino)
            const cuentaActual = getId(currentAccountId)
            const tipo = String(tx.tipo || '').toLowerCase()
            const esSalida = tipo === 'compra' || (tipo === 'transferencia' && cuentaOrigen && cuentaOrigen === cuentaActual)
            const esEntrada = tipo === 'deposito' || tipo === 'credito' || tipo === 'reversion' || (tipo === 'transferencia' && cuentaDestino && cuentaDestino === cuentaActual)
            return { ...tx, esSalida: esSalida && !esEntrada, origenDashboard: 'transaccion' }
        })
        return [...normalizedTransactions, ...missingProductCharges]
            .sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha))
            .slice(0, 6)
    }, [transactions, missingProductCharges, currentAccountId])

    const handleCancelSubscription = async (subscription) => {
        const id = subscription._id || subscription.id
        const nombre = getProductName(subscription)
        const confirmed = window.confirm(`¿Desea cancelar la suscripción "${nombre}"?`)
        if (!confirmed) return
        const toastId = toast.loading('Cancelando suscripción...')
        try {
            await cancelSubscription(id, { motivoCancelacion: 'Cancelada por el cliente desde el dashboard' })
            await fetchMyProductAcquisitions()
            toast.success('Suscripción cancelada correctamente', { id: toastId })
        } catch (error) {
            toast.error(error?.response?.data?.message || 'No se pudo cancelar la suscripción', { id: toastId })
        }
    }

    const iniciales = (user?.nombre || user?.username || 'U').slice(0, 2).toUpperCase()

    const estiloPanel = {
        backgroundColor: '#1a1208',
        border: '1px solid var(--borde-card)',
        borderRadius: '14px',
        overflow: 'hidden',
    }

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="relative">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #b8892a 0%, #6b4a10 100%)',
                                boxShadow: '0 4px 20px rgba(184,137,42,0.30)',
                                fontFamily: 'var(--font-display)',
                                color: '#0e0a05',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {iniciales}
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
                            style={{ backgroundColor: '#5cb87a', borderColor: '#0e0a05' }}
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-blanco)', fontFamily: 'var(--font-body)' }}>
                            Bienvenido,{' '}
                            <span style={{ color: 'var(--oro-claro)' }}>
                                {user?.nombre || user?.username || 'Usuario'}
                            </span>
                        </h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--texto-tenue)' }}>
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
                    className="btn-oro flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm"
                >
                    <Plus size={16} />
                    Nueva Transferencia
                </motion.button>
            </div>

            <div className="linea-oro mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard icon={CreditCard}   label="Cuentas Activas"      value={activeAccounts}            colorIdx={0} delay={0}   path="/accounts"  loading={loadingAccounts} />
                <StatCard icon={TrendingUp}   label="Saldo Consolidado"     value={fmt(totalBalance)}         colorIdx={1} delay={0.1} loading={loadingAccounts} />
                <StatCard icon={Star}         label="Favoritos Guardados"   value={favorites.length}          colorIdx={2} delay={0.2} path="/favorites"  loading={loadingFavorites} />
                <StatCard icon={ReceiptText}  label="Suscripciones Activas" value={activeSubscriptions.length} colorIdx={3} delay={0.3} path="/products"  loading={loadingProducts} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ ...estiloPanel, padding: '1.5rem' }}
                >
                    <h2
                        className="font-bold text-base mb-5 flex items-center gap-2"
                        style={{ color: 'var(--texto-blanco)' }}
                    >
                        <PackageCheck size={17} style={{ color: 'var(--oro-medio)' }} />
                        Mis Productos
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--texto-tenue)' }}>
                                Tipos de Cuenta
                            </p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--texto-claro)' }}>
                                {accountTypes}
                            </p>
                        </div>

                        <div className="linea-oro" />

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--texto-tenue)' }}>
                                Suscripciones Activas
                            </p>

                            {loadingProducts ? (
                                <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(184,137,42,0.06)' }} />
                                    ))}
                                </div>
                            ) : activeSubscriptions.length === 0 ? (
                                <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(184,137,42,0.04)', border: '1px solid var(--borde-sutil)' }}>
                                    <p className="text-sm" style={{ color: 'var(--texto-muted)' }}>
                                        No tiene suscripciones activas.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeSubscriptions.map((subscription) => (
                                        <div
                                            key={subscription._id || subscription.id}
                                            className="rounded-xl p-3.5"
                                            style={{
                                                backgroundColor: 'rgba(184,137,42,0.06)',
                                                border: '1px solid rgba(184,137,42,0.14)',
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-bold text-sm" style={{ color: 'var(--texto-blanco)' }}>
                                                        {getProductName(subscription)}
                                                    </p>
                                                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--texto-tenue)' }}>
                                                        <CalendarDays size={11} />
                                                        Próximo cobro: {dateFmt(getNextChargeDate(subscription))}
                                                    </p>
                                                    <p className="text-sm font-black mt-1.5" style={{ color: 'var(--oro-claro)' }}>
                                                        {fmt(subscription.monto || subscription.totalEstimado || subscription.montoCobradoInicial)}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelSubscription(subscription)}
                                                    disabled={loadingProducts}
                                                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                                                    style={{ backgroundColor: 'rgba(200,60,60,0.08)', color: '#c87a7a' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(200,60,60,0.15)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(200,60,60,0.08)'}
                                                >
                                                    <XCircle size={13} />
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
                        className="mt-6 flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold transition-all"
                        style={{
                            backgroundColor: 'rgba(184,137,42,0.08)',
                            border: '1px solid rgba(184,137,42,0.20)',
                            color: 'var(--oro-claro)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(184,137,42,0.14)'
                            e.currentTarget.style.borderColor = 'rgba(184,137,42,0.35)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(184,137,42,0.08)'
                            e.currentTarget.style.borderColor = 'rgba(184,137,42,0.20)'
                        }}
                    >
                        Ver Catálogo
                    </NavLink>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 flex flex-col"
                    style={estiloPanel}
                >
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ borderBottom: '1px solid rgba(184,137,42,0.10)' }}
                    >
                        <h2 className="font-bold text-base" style={{ color: 'var(--texto-blanco)' }}>
                            Actividad Reciente
                        </h2>
                        <button
                            type="button"
                            onClick={() => {
                                if (currentAccountId) fetchTransactions(currentAccountId)
                                fetchMyProductAcquisitions()
                            }}
                            className="text-xs font-bold uppercase tracking-widest transition-colors"
                            style={{ color: 'var(--texto-tenue)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                        >
                            Actualizar
                        </button>
                    </div>

                    <div className="flex-1">
                        {loadingTx || loadingProducts ? (
                            <div className="p-6 space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(184,137,42,0.06)' }} />
                                ))}
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-sm" style={{ color: 'var(--texto-muted)' }}>
                                    No se encontraron movimientos recientes.
                                </p>
                            </div>
                        ) : (
                            <div>
                                {recentActivity.map((item, idx) => {
                                    const esSalida = item.esSalida
                                    const tipo = String(item.tipo || '').toLowerCase()
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + idx * 0.05 }}
                                            key={item._id || item.id}
                                            className="flex items-center justify-between px-6 py-4 transition-colors"
                                            style={{ borderBottom: '1px solid rgba(184,137,42,0.06)' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(184,137,42,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        backgroundColor: esSalida
                                                            ? 'rgba(200,60,60,0.10)'
                                                            : 'rgba(45,122,79,0.10)',
                                                    }}
                                                >
                                                    {esSalida ? (
                                                        <ArrowUpRight size={16} style={{ color: '#c87a7a' }} />
                                                    ) : (
                                                        <ArrowDownLeft size={16} style={{ color: '#5cb87a' }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm capitalize" style={{ color: 'var(--texto-blanco)' }}>
                                                        {tipo === 'suscripcion' ? 'Cobro de suscripción'
                                                            : tipo === 'compra' ? 'Cobro de producto'
                                                            : tipo}
                                                    </p>
                                                    <p className="text-xs" style={{ color: 'var(--texto-tenue)' }}>
                                                        {item.descripcion || dateFmt(item.createdAt || item.fecha)}
                                                    </p>
                                                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--texto-muted)' }}>
                                                        {dateFmt(item.createdAt || item.fecha)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className="font-black text-sm"
                                                    style={{ color: esSalida ? '#c87a7a' : '#5cb87a' }}
                                                >
                                                    {esSalida ? '-' : '+'}{fmt(item.monto)}
                                                </p>
                                                <p className="text-[10px] font-mono" style={{ color: 'var(--texto-muted)' }}>
                                                    {item.numeroCuentaDestino || item.numeroCuentaOrigen || item.origenDashboard || 'N/A'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div
                        className="p-4 grid grid-cols-2 gap-3"
                        style={{ borderTop: '1px solid rgba(184,137,42,0.10)' }}
                    >
                        <NavLink
                            to="/products"
                            className="flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                            style={{
                                backgroundColor: 'rgba(184,137,42,0.08)',
                                border: '1px solid rgba(184,137,42,0.18)',
                                color: 'var(--oro-claro)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(184,137,42,0.14)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(184,137,42,0.08)'}
                        >
                            Ver Catálogo
                        </NavLink>
                        <button
                            onClick={() => setShowTransferModal(true)}
                            className="btn-oro flex items-center justify-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                            Nueva Transferencia
                        </button>
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