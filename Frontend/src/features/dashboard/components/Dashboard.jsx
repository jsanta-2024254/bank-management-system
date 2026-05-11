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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={22} className="text-white" />
            </div>
            {path && (
                <NavLink
                    to={path}
                    className="text-xs text-zinc-500 hover:text-blue-400 transition-colors font-semibold"
                >
                    Ver →
                </NavLink>
            )}
        </div>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        {loading ? (
            <div className="h-10 w-24 bg-zinc-800 rounded-xl animate-pulse mt-1" />
        ) : (
            <p className="text-white text-4xl font-black">{value}</p>
        )}
    </motion.div>
)

// ─── Custom Tooltip for Chart ────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1 capitalize">
                {label}
            </p>
            <p className="text-white font-black text-lg">{fmt(payload[0].value)}</p>
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

    const CHART_COLORS = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626']

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30">
                        <Landmark size={26} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">
                            Bienvenido, {user?.username || 'Usuario'}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-0.5 flex items-center gap-1.5">
                            <Shield size={13} /> {role}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                    role === 'ADMIN_ROLE' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                } gap-5 mb-10`}
            >
                <StatCard
                    icon={CreditCard}
                    label="Cuentas activas"
                    value={activeAccounts}
                    color="bg-blue-600"
                    delay={0}
                    path="/accounts"
                    loading={loadingAccounts}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Saldo total"
                    value={fmt(totalBalance)}
                    color="bg-emerald-600"
                    delay={0.05}
                    loading={loadingAccounts}
                />
                <StatCard
                    icon={ArrowLeftRight}
                    label="Transacciones del mes"
                    value={txThisMonth}
                    color="bg-zinc-700"
                    delay={0.1}
                    path="/transactions"
                    loading={loadingTx}
                />
                {role === 'ADMIN_ROLE' && (
                    <StatCard
                        icon={Users}
                        label="Usuarios"
                        value={users.length}
                        color="bg-violet-600"
                        delay={0.15}
                        path="/users"
                    />
                )}
            </div>

            {/* Chart + Recent Transactions side by side on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                {/* Bar Chart: saldo por tipo de cuenta */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-3xl p-6"
                >
                    <h2 className="text-white font-bold text-xl mb-1">Saldo por tipo de cuenta</h2>
                    <p className="text-zinc-500 text-xs mb-6">Ahorro vs. Monetaria</p>

                    {loadingAccounts ? (
                        <div className="h-52 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-52 flex items-center justify-center text-zinc-600 text-sm">
                            Sin datos de cuentas
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart data={chartData} barSize={40}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.05)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) =>
                                        v.charAt(0).toUpperCase() + v.slice(1)
                                    }
                                />
                                <YAxis
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) =>
                                        v >= 1000 ? `Q${(v / 1000).toFixed(0)}k` : `Q${v}`
                                    }
                                    width={50}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                />
                                <Bar dataKey="saldo" radius={[8, 8, 0, 0]}>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="lg:col-span-3 bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden"
                >
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                        <h2 className="text-white font-bold text-xl">Últimas transacciones</h2>
                        <NavLink
                            to="/transactions"
                            className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
                        >
                            Ver todas →
                        </NavLink>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.03]">
                                    <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                                        Tipo
                                    </th>
                                    <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                                        Monto
                                    </th>
                                    <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                                        Cuenta destino
                                    </th>
                                    <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                                        Fecha
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loadingTx ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={4} className="px-8 py-4">
                                                <div className="h-4 bg-zinc-800 rounded-full animate-pulse w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : recentTransactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-8 py-10 text-center text-zinc-500 text-sm"
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
                                            className="hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                                                            t.tipo === 'transferencia'
                                                                ? 'bg-blue-500/10'
                                                                : 'bg-emerald-500/10'
                                                        }`}
                                                    >
                                                        {t.tipo === 'transferencia' ? (
                                                            <ArrowUpRight
                                                                size={13}
                                                                className="text-blue-400"
                                                            />
                                                        ) : (
                                                            <ArrowDownLeft
                                                                size={13}
                                                                className="text-emerald-400"
                                                            />
                                                        )}
                                                    </div>
                                                    <span className="text-white text-sm font-semibold capitalize">
                                                        {t.tipo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td
                                                className={`px-8 py-4 font-bold text-sm ${
                                                    t.tipo === 'transferencia'
                                                        ? 'text-white'
                                                        : 'text-emerald-400'
                                                }`}
                                            >
                                                {fmt(t.monto)}
                                            </td>
                                            <td className="px-8 py-4 text-zinc-400 font-mono text-xs">
                                                {t.numeroCuentaDestino || '—'}
                                            </td>
                                            <td className="px-8 py-4 text-zinc-500 text-xs">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <h2 className="text-white font-bold text-xl">Cuentas Recientes</h2>
                    <NavLink
                        to="/accounts"
                        className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
                    >
                        Ver todas →
                    </NavLink>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.03]">
                                <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                                    Número
                                </th>
                                <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                                    Tipo
                                </th>
                                <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                                    Saldo
                                </th>
                                <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loadingAccounts
                                ? Array.from({ length: 3 }).map((_, i) => (
                                      <tr key={i}>
                                          <td colSpan={4} className="px-8 py-4">
                                              <div className="h-4 bg-zinc-800 rounded-full animate-pulse w-full" />
                                          </td>
                                      </tr>
                                  ))
                                : accounts.slice(0, 5).map((a) => (
                                      <tr
                                          key={a._id}
                                          className="hover:bg-white/[0.03] transition-colors"
                                      >
                                          <td className="px-8 py-4 text-white font-mono text-sm">
                                              {a.numeroCuenta}
                                          </td>
                                          <td className="px-8 py-4 text-zinc-400 text-sm capitalize">
                                              {a.tipoCuenta}
                                          </td>
                                          <td className="px-8 py-4 text-white text-sm font-semibold">
                                              {new Intl.NumberFormat('es-GT', {
                                                  style: 'currency',
                                                  currency: 'GTQ',
                                              }).format(a.saldo || 0)}
                                          </td>
                                          <td className="px-8 py-4">
                                              <span
                                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                      a.estado
                                                          ? 'bg-green-500/10 text-green-400'
                                                          : 'bg-zinc-700/40 text-zinc-500'
                                                  }`}
                                              >
                                                  <span
                                                      className={`w-1.5 h-1.5 rounded-full ${
                                                          a.estado ? 'bg-green-400' : 'bg-zinc-500'
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
                                        className="px-8 py-10 text-center text-zinc-500 text-sm"
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