import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Users,
    ArrowLeftRight,
    Shield,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import useAuthStore from '../../auth/store/authStore'
import useAccountStore from '../../accounts/store/accountStore'
import useUserStore from '../../users/store/userStore'
import useTransactionStore from '../../transactions/store/transactionStore'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
    new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ',
        maximumFractionDigits: 0,
    }).format(n)

const dateFmt = (d) =>
    new Date(d).toLocaleDateString('es-GT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

// ─── Stat Card ───────────────────────────────────────────────────────────────

const coloresCard = [
    { fondo: 'rgba(184,137,42,0.12)', borde: 'rgba(184,137,42,0.30)', icono: '#b8892a' },
    { fondo: 'rgba(45,122,79,0.12)',  borde: 'rgba(45,122,79,0.30)',  icono: '#5cb87a' },
    { fondo: 'rgba(74,56,32,0.20)',   borde: 'rgba(184,137,42,0.15)', icono: '#7a6040' },
    { fondo: 'rgba(100,70,130,0.12)', borde: 'rgba(130,90,180,0.25)', icono: '#a07ac8' },
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
                border: `1px solid var(--borde-card)`,
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
            <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: 'var(--texto-tenue)' }}
            >
                {label}
            </p>
            {loading ? (
                <div
                    className="h-8 w-20 rounded-lg animate-pulse mt-1"
                    style={{ backgroundColor: 'rgba(184,137,42,0.08)' }}
                />
            ) : (
                <p
                    className="text-3xl font-black"
                    style={{ color: 'var(--texto-blanco)', fontFamily: 'var(--font-body)' }}
                >
                    {value}
                </p>
            )}
        </motion.div>
    )
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div
            className="px-4 py-3 rounded-xl shadow-xl"
            style={{
                backgroundColor: '#160f06',
                border: '1px solid rgba(184,137,42,0.25)',
            }}
        >
            <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1 capitalize"
                style={{ color: 'var(--texto-tenue)' }}
            >
                {label}
            </p>
            <p className="font-black text-lg" style={{ color: 'var(--oro-claro)' }}>
                {fmt(payload[0].value)}
            </p>
        </div>
    )
}

// ─── Estilos compartidos de panel ────────────────────────────────────────────

const estiloPanel = {
    backgroundColor: '#1a1208',
    border: '1px solid var(--borde-card)',
    borderRadius: '14px',
    overflow: 'hidden',
}

const estiloCabecera = {
    borderBottom: '1px solid rgba(184,137,42,0.10)',
    padding: '1.25rem 1.75rem',
}

const estiloTh = {
    color: 'var(--texto-tenue)',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    padding: '0.75rem 1.75rem',
    backgroundColor: 'rgba(184,137,42,0.04)',
}

const estiloTd = {
    padding: '0.875rem 1.75rem',
    borderBottom: '1px solid rgba(184,137,42,0.06)',
    fontSize: '13px',
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard = () => {
    const user = useAuthStore((s) => s.user)
    const role = user?.roles?.[0]

    const { accounts, loading: loadingAccounts, fetchAccounts } = useAccountStore()
    const { users, fetchUsers } = useUserStore()
    const {
        transactions,
        loading: loadingTx,
        setCurrentAccountId,
        currentAccountId,
    } = useTransactionStore()

    useEffect(() => {
        fetchAccounts()
        if (role === 'ADMIN_ROLE') fetchUsers()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (accounts.length > 0 && !currentAccountId) {
            setCurrentAccountId(accounts[0]._id)
        }
    }, [accounts, currentAccountId, setCurrentAccountId])

    const activeAccounts = useMemo(() => accounts.filter((a) => a.estado).length, [accounts])

    const totalBalance = useMemo(
        () => accounts.reduce((sum, a) => sum + (a.saldo || 0), 0),
        [accounts]
    )

    const now = new Date()
    const txThisMonth = useMemo(
        () =>
            transactions.filter((t) => {
                const d = new Date(t.createdAt || t.fecha)
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length,
        [transactions] // eslint-disable-line react-hooks/exhaustive-deps
    )

    const recentTransactions = useMemo(
        () =>
            [...transactions]
                .sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha))
                .slice(0, 5),
        [transactions]
    )

    const chartData = useMemo(() => {
        const groups = {}
        accounts.forEach((a) => {
            const tipo = a.tipoCuenta || 'otro'
            groups[tipo] = (groups[tipo] || 0) + (a.saldo || 0)
        })
        return Object.entries(groups).map(([name, saldo]) => ({ name, saldo }))
    }, [accounts])

    const CHART_COLORS = ['#b8892a', '#5cb87a', '#a07ac8', '#c87a7a']

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="pb-10">

            {/* ── Encabezado ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, #b8892a 0%, #6b4a10 100%)',
                            boxShadow: '0 4px 20px rgba(184,137,42,0.30)',
                        }}
                    >
                        <Shield size={20} style={{ color: '#0e0a05' }} />
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: 'var(--texto-blanco)', fontFamily: 'var(--font-body)' }}
                        >
                            Bienvenido,{' '}
                            <span style={{ color: 'var(--oro-claro)' }}>
                                {user?.username || 'Usuario'}
                            </span>
                        </h1>
                        <p
                            className="text-xs mt-0.5 uppercase tracking-widest"
                            style={{ color: 'var(--texto-tenue)' }}
                        >
                            {role === 'ADMIN_ROLE' ? 'Administrador' : 'Cliente'}
                        </p>
                    </div>
                </div>
                <div className="linea-oro mt-6" />
            </motion.div>

            {/* ── Tarjetas de resumen ── */}
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                    role === 'ADMIN_ROLE' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                } gap-4 mb-8`}
            >
                <StatCard
                    icon={CreditCard}
                    label="Cuentas activas"
                    value={activeAccounts}
                    colorIdx={0}
                    delay={0}
                    path="/accounts"
                    loading={loadingAccounts}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Saldo total"
                    value={fmt(totalBalance)}
                    colorIdx={1}
                    delay={0.05}
                    loading={loadingAccounts}
                />
                <StatCard
                    icon={ArrowLeftRight}
                    label="Transacciones del mes"
                    value={txThisMonth}
                    colorIdx={2}
                    delay={0.1}
                    path="/transactions"
                    loading={loadingTx}
                />
                {role === 'ADMIN_ROLE' && (
                    <StatCard
                        icon={Users}
                        label="Usuarios"
                        value={users.length}
                        colorIdx={3}
                        delay={0.15}
                        path="/users"
                    />
                )}
            </div>

            {/* ── Gráfico + Transacciones recientes ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

                {/* Gráfico de barras */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                    style={{ ...estiloPanel, padding: '1.5rem' }}
                >
                    <h2
                        className="font-bold text-base mb-0.5"
                        style={{ color: 'var(--texto-blanco)' }}
                    >
                        Saldo por tipo de cuenta
                    </h2>
                    <p className="text-xs mb-5" style={{ color: 'var(--texto-tenue)' }}>
                        Ahorro vs. Monetaria
                    </p>

                    {loadingAccounts ? (
                        <div className="h-52 flex items-center justify-center">
                            <div
                                className="w-7 h-7 border-2 rounded-full animate-spin"
                                style={{ borderColor: 'rgba(184,137,42,0.2)', borderTopColor: '#b8892a' }}
                            />
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-52 flex items-center justify-center text-sm" style={{ color: 'var(--texto-muted)' }}>
                            Sin datos de cuentas
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart data={chartData} barSize={36}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(184,137,42,0.06)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#7a6040', fontSize: 11, fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                                />
                                <YAxis
                                    tick={{ fill: '#7a6040', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => v >= 1000 ? `Q${(v / 1000).toFixed(0)}k` : `Q${v}`}
                                    width={50}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'rgba(184,137,42,0.04)' }}
                                />
                                <Bar dataKey="saldo" radius={[6, 6, 0, 0]}>
                                    {chartData.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Últimas transacciones */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="lg:col-span-3"
                    style={estiloPanel}
                >
                    <div className="flex items-center justify-between" style={estiloCabecera}>
                        <h2 className="font-bold text-base" style={{ color: 'var(--texto-blanco)' }}>
                            Últimas transacciones
                        </h2>
                        <NavLink
                            to="/transactions"
                            className="text-xs font-bold uppercase tracking-widest transition-colors"
                            style={{ color: 'var(--texto-tenue)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                        >
                            Ver todas →
                        </NavLink>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th style={estiloTh}>Tipo</th>
                                    <th style={estiloTh}>Monto</th>
                                    <th style={estiloTh}>Cuenta destino</th>
                                    <th style={estiloTh}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingTx ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={4} style={estiloTd}>
                                                <div
                                                    className="h-3 rounded-full animate-pulse w-full"
                                                    style={{ backgroundColor: 'rgba(184,137,42,0.08)' }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : recentTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-sm" style={{ color: 'var(--texto-muted)' }}>
                                            {currentAccountId ? 'No hay transacciones aún.' : 'No hay cuentas disponibles.'}
                                        </td>
                                    </tr>
                                ) : (
                                    recentTransactions.map((t) => (
                                        <tr
                                            key={t._id}
                                            style={{ transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(184,137,42,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                                        >
                                            <td style={estiloTd}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{
                                                            backgroundColor: t.tipo === 'transferencia'
                                                                ? 'rgba(184,137,42,0.12)'
                                                                : 'rgba(45,122,79,0.12)',
                                                        }}
                                                    >
                                                        {t.tipo === 'transferencia' ? (
                                                            <ArrowUpRight size={11} style={{ color: '#b8892a' }} />
                                                        ) : (
                                                            <ArrowDownLeft size={11} style={{ color: '#5cb87a' }} />
                                                        )}
                                                    </div>
                                                    <span
                                                        className="capitalize font-semibold"
                                                        style={{ color: 'var(--texto-blanco)' }}
                                                    >
                                                        {t.tipo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    ...estiloTd,
                                                    color: t.tipo === 'transferencia' ? 'var(--texto-blanco)' : '#5cb87a',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {fmt(t.monto)}
                                            </td>
                                            <td style={{ ...estiloTd, color: 'var(--texto-tenue)', fontFamily: 'monospace', fontSize: '11px' }}>
                                                {t.numeroCuentaDestino || '—'}
                                            </td>
                                            <td style={{ ...estiloTd, color: 'var(--texto-muted)', fontSize: '11px' }}>
                                                {dateFmt(t.createdAt || t.fecha)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* ── Cuentas recientes ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={estiloPanel}
            >
                <div className="flex items-center justify-between" style={estiloCabecera}>
                    <h2 className="font-bold text-base" style={{ color: 'var(--texto-blanco)' }}>
                        Cuentas Recientes
                    </h2>
                    <NavLink
                        to="/accounts"
                        className="text-xs font-bold uppercase tracking-widest transition-colors"
                        style={{ color: 'var(--texto-tenue)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                    >
                        Ver todas →
                    </NavLink>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th style={estiloTh}>Número</th>
                                <th style={estiloTh}>Tipo</th>
                                <th style={estiloTh}>Saldo</th>
                                <th style={estiloTh}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingAccounts
                                ? Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={4} style={estiloTd}>
                                            <div
                                                className="h-3 rounded-full animate-pulse w-full"
                                                style={{ backgroundColor: 'rgba(184,137,42,0.08)' }}
                                            />
                                        </td>
                                    </tr>
                                ))
                                : accounts.slice(0, 5).map((a) => (
                                    <tr
                                        key={a._id}
                                        style={{ transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(184,137,42,0.04)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                                    >
                                        <td style={{ ...estiloTd, color: 'var(--texto-blanco)', fontFamily: 'monospace' }}>
                                            {a.numeroCuenta}
                                        </td>
                                        <td style={{ ...estiloTd, color: 'var(--texto-claro)', textTransform: 'capitalize' }}>
                                            {a.tipoCuenta}
                                        </td>
                                        <td style={{ ...estiloTd, color: 'var(--oro-claro)', fontWeight: 700 }}>
                                            {new Intl.NumberFormat('es-GT', {
                                                style: 'currency',
                                                currency: 'GTQ',
                                            }).format(a.saldo || 0)}
                                        </td>
                                        <td style={estiloTd}>
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                style={
                                                    a.estado
                                                        ? { backgroundColor: 'rgba(45,122,79,0.15)', color: '#5cb87a', border: '1px solid rgba(45,122,79,0.25)' }
                                                        : { backgroundColor: 'rgba(74,56,32,0.20)', color: 'var(--texto-tenue)', border: '1px solid rgba(74,56,32,0.25)' }
                                                }
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: a.estado ? '#5cb87a' : 'var(--texto-muted)' }}
                                                />
                                                {a.estado ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            {!loadingAccounts && accounts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-sm" style={{ color: 'var(--texto-muted)' }}>
                                        No hay cuentas aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}

export default Dashboard