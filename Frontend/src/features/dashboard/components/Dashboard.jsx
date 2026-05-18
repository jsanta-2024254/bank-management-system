import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Users,
    ArrowLeftRight,
    Landmark,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Stat Card ──────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, path, delay, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 18 }}
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
            <p className="relative text-4xl font-black tracking-tight text-[#3f2c12]">
                {value}
            </p>
        )}
    </motion.div>
)

// ─── Custom Tooltip for Chart ────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-2xl border border-[#d7bc73]/50 bg-[#fffaf0]/95 px-4 py-3 shadow-[0_18px_45px_rgba(92,64,19,0.18)] backdrop-blur-xl">
            <p className="mb-1 text-xs font-black uppercase tracking-[0.22em] text-[#8a611b]/70 capitalize">
                {label}
            </p>

            <p className="text-lg font-black text-[#3f2c12]">
                {fmt(payload[0].value)}
            </p>
        </div>
    )
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

    // Fetch accounts and users on mount
    useEffect(() => {
        fetchAccounts()
        if (role === 'ADMIN_ROLE') fetchUsers()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Once accounts are loaded, set the first account to trigger transaction fetch
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

    // Transactions this month
    const now = new Date()
    const txThisMonth = useMemo(
        () =>
            transactions.filter((t) => {
                const d = new Date(t.createdAt || t.fecha)
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length,
        [transactions] // eslint-disable-line react-hooks/exhaustive-deps
    )

    // Last 5 transactions
    const recentTransactions = useMemo(
        () =>
            [...transactions]
                .sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha))
                .slice(0, 5),
        [transactions]
    )

    // Chart data: saldo por tipo de cuenta
    const chartData = useMemo(() => {
        const groups = {}
        accounts.forEach((a) => {
            const tipo = a.tipoCuenta || 'otro'
            groups[tipo] = (groups[tipo] || 0) + (a.saldo || 0)
        })
        return Object.entries(groups).map(([name, saldo]) => ({ name, saldo }))
    }, [accounts])

    const CHART_COLORS = ['#b98219', '#d9b45e', '#8a611b', '#c89b3c', '#7a4f0d']

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="relative overflow-hidden rounded-[2rem] border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                    <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[#d9b45e]/18 blur-3xl" />
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-gradient-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                                <Landmark size={29} className="text-[#5b3a0d]" />
                            </div>

                            <div>
                                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                    Resumen ejecutivo
                                </p>

                                <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                    Bienvenido, {user?.username || 'Usuario'}
                                </h1>

                                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#7a6849]">
                                    <Shield size={14} className="text-[#9a6b16]" />
                                    {role}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#d7bc73]/40 bg-white/48 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                Panel administrativo
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#3f2c12]">
                                Gestión centralizada de cuentas, usuarios y movimientos
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div
                className={`mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 ${role === 'ADMIN_ROLE' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                    }`}
            >
                <StatCard
                    icon={CreditCard}
                    label="Cuentas activas"
                    value={activeAccounts}
                    color="bg-gradient-to-br from-[#fff1bd] via-[#d9b45e] to-[#b98219]"
                    delay={0}
                    path="/accounts"
                    loading={loadingAccounts}
                />

                <StatCard
                    icon={TrendingUp}
                    label="Saldo total"
                    value={fmt(totalBalance)}
                    color="bg-gradient-to-br from-[#f7e7b1] via-[#c89b3c] to-[#8a611b]"
                    delay={0.05}
                    loading={loadingAccounts}
                />

                <StatCard
                    icon={ArrowLeftRight}
                    label="Transacciones del mes"
                    value={txThisMonth}
                    color="bg-gradient-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16]"
                    delay={0.1}
                    path="/transactions"
                    loading={loadingTx}
                />

                {role === 'ADMIN_ROLE' && (
                    <StatCard
                        icon={Users}
                        label="Usuarios"
                        value={users.length}
                        color="bg-gradient-to-br from-[#f5df9b] via-[#c89b3c] to-[#7a4f0d]"
                        delay={0.15}
                        path="/users"
                    />
                )}
            </div>

            {/* Chart + Recent Transactions side by side on large screens */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Bar Chart: saldo por tipo de cuenta */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-[2rem] border border-[#d7bc73]/45 bg-[#fffaf0]/68 p-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl lg:col-span-2"
                >
                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#d9b45e]/16 blur-3xl" />
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <div className="relative mb-6">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Distribución financiera
                        </p>

                        <h2 className="text-xl font-black text-[#3f2c12]">
                            Saldo por tipo de cuenta
                        </h2>

                        <p className="mt-1 text-xs font-medium text-[#7a6849]">
                            Ahorro vs. Monetaria
                        </p>
                    </div>

                    {loadingAccounts ? (
                        <div className="flex h-52 items-center justify-center">
                            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#ead9ad] border-t-[#9a6b16]" />
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="flex h-52 items-center justify-center rounded-3xl border border-dashed border-[#d7bc73]/45 bg-white/30 text-sm font-semibold text-[#8a6a3a]">
                            Sin datos de cuentas
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart data={chartData} barSize={42}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(138,97,27,0.14)"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fill: '#7a6849',
                                        fontSize: 11,
                                        fontWeight: 800,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) =>
                                        v.charAt(0).toUpperCase() + v.slice(1)
                                    }
                                />

                                <YAxis
                                    tick={{ fill: '#8a6a3a', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) =>
                                        v >= 1000 ? `Q${(v / 1000).toFixed(0)}k` : `Q${v}`
                                    }
                                    width={50}
                                />

                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'rgba(217,180,94,0.14)' }}
                                />

                                <Bar dataKey="saldo" radius={[12, 12, 0, 0]}>
                                    {chartData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Recent Transactions Table */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="relative overflow-hidden rounded-[2rem] border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl lg:col-span-3"
                >
                    <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                    <div className="flex items-center justify-between border-b border-[#d7bc73]/35 px-6 py-5 md:px-8">
                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                Movimientos recientes
                            </p>

                            <h2 className="text-xl font-black text-[#3f2c12]">
                                Últimas transacciones
                            </h2>
                        </div>

                        <NavLink
                            to="/transactions"
                            className="rounded-full border border-[#d7bc73]/40 bg-white/52 px-4 py-2 text-sm font-black text-[#8a611b] transition-all hover:border-[#b98219]/60 hover:bg-[#fff8df] hover:text-[#3f2c12]"
                        >
                            Ver todas →
                        </NavLink>
                    </div>

                    <div className="custom-scrollbar overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#d7bc73]/28 bg-[#ead9ad]/22">
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Tipo
                                    </th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Monto
                                    </th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Cuenta destino
                                    </th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                        Fecha
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#d7bc73]/28">
                                {loadingTx ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={4} className="px-8 py-4">
                                                <div className="h-4 w-full animate-pulse rounded-full bg-[#ead9ad]/70" />
                                            </td>
                                        </tr>
                                    ))
                                ) : recentTransactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-8 py-10 text-center text-sm font-semibold text-[#8a6a3a]"
                                        >
                                            {currentAccountId
                                                ? 'No hay transacciones aún.'
                                                : 'No hay cuentas disponibles.'}
                                        </td>
                                    </tr>
                                ) : (
                                    recentTransactions.map((t) => (
                                        <tr
                                            key={t._id}
                                            className="transition-colors hover:bg-white/35"
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-xl border ${t.tipo === 'transferencia'
                                                                ? 'border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b]'
                                                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            }`}
                                                    >
                                                        {t.tipo === 'transferencia' ? (
                                                            <ArrowUpRight size={14} />
                                                        ) : (
                                                            <ArrowDownLeft size={14} />
                                                        )}
                                                    </div>

                                                    <span className="text-sm font-black capitalize text-[#3f2c12]">
                                                        {t.tipo}
                                                    </span>
                                                </div>
                                            </td>

                                            <td
                                                className={`px-8 py-4 text-sm font-black ${t.tipo === 'transferencia'
                                                        ? 'text-[#3f2c12]'
                                                        : 'text-emerald-700'
                                                    }`}
                                            >
                                                {fmt(t.monto)}
                                            </td>

                                            <td className="px-8 py-4 font-mono text-xs font-semibold text-[#7a6849]">
                                                {t.numeroCuentaDestino || '—'}
                                            </td>

                                            <td className="px-8 py-4 text-xs font-semibold text-[#8a6a3a]">
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

            {/* Recent Accounts Table */}
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden rounded-[2rem] border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl"
            >
                <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                <div className="flex items-center justify-between border-b border-[#d7bc73]/35 px-6 py-5 md:px-8">
                    <div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Control de cuentas
                        </p>

                        <h2 className="text-xl font-black text-[#3f2c12]">
                            Cuentas recientes
                        </h2>
                    </div>

                    <NavLink
                        to="/accounts"
                        className="rounded-full border border-[#d7bc73]/40 bg-white/52 px-4 py-2 text-sm font-black text-[#8a611b] transition-all hover:border-[#b98219]/60 hover:bg-[#fff8df] hover:text-[#3f2c12]"
                    >
                        Ver todas →
                    </NavLink>
                </div>

                <div className="custom-scrollbar overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#d7bc73]/28 bg-[#ead9ad]/22">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Número
                                </th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Tipo
                                </th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Saldo
                                </th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Estado
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#d7bc73]/28">
                            {loadingAccounts
                                ? Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={4} className="px-8 py-4">
                                            <div className="h-4 w-full animate-pulse rounded-full bg-[#ead9ad]/70" />
                                        </td>
                                    </tr>
                                ))
                                : accounts.slice(0, 5).map((a) => (
                                    <tr
                                        key={a._id}
                                        className="transition-colors hover:bg-white/35"
                                    >
                                        <td className="px-8 py-4 font-mono text-sm font-black text-[#3f2c12]">
                                            {a.numeroCuenta}
                                        </td>

                                        <td className="px-8 py-4 text-sm font-semibold capitalize text-[#7a6849]">
                                            {a.tipoCuenta}
                                        </td>

                                        <td className="px-8 py-4 text-sm font-black text-[#3f2c12]">
                                            {new Intl.NumberFormat('es-GT', {
                                                style: 'currency',
                                                currency: 'GTQ',
                                            }).format(a.saldo || 0)}
                                        </td>

                                        <td className="px-8 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${a.estado
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-[#d7bc73]/40 bg-[#ead9ad]/35 text-[#8a6a3a]'
                                                    }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${a.estado ? 'bg-emerald-600' : 'bg-[#9a6b16]'
                                                        }`}
                                                />
                                                {a.estado ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                            {!loadingAccounts && accounts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-8 py-10 text-center text-sm font-semibold text-[#8a6a3a]"
                                    >
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