import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Users, TrendingUp, ArrowLeftRight, Landmark, Shield } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useAuthStore from '../../auth/store/authStore'
import useAccountStore from '../../accounts/store/accountStore'
import useUserStore from '../../users/store/userStore'

const StatCard = ({ icon: Icon, label, value, color, path, delay }) => (
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
                <NavLink to={path} className="text-xs text-zinc-500 hover:text-blue-400 transition-colors font-semibold">
                    Ver →
                </NavLink>
            )}
        </div>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white text-4xl font-black">{value}</p>
    </motion.div>
)

const Dashboard = () => {
    const user = useAuthStore((s) => s.user)
    const role = user?.roles?.[0]

    const { accounts, fetchAccounts } = useAccountStore()
    const { users, fetchUsers } = useUserStore()

    useEffect(() => {
        fetchAccounts()
        if (role === 'ADMIN_ROLE') fetchUsers()
    }, [])

    const activeAccounts = accounts.filter((a) => a.estado).length
    const totalBalance = accounts.reduce((sum, a) => sum + (a.saldo || 0), 0)
    const fmt = (n) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 0 }).format(n)

    return (
        <div className="pb-10">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/30">
                        <Landmark size={26} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">
                            Bienvenido, {user?.username || 'Usuario'} 👋
                        </h1>
                        <p className="text-zinc-500 text-sm mt-0.5 flex items-center gap-1.5">
                            <Shield size={13} /> {role}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === 'ADMIN_ROLE' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-5 mb-10`}>
                <StatCard icon={CreditCard} label="Cuentas activas" value={activeAccounts} color="bg-blue-600" delay={0} path="/accounts" />
                <StatCard icon={TrendingUp} label="Saldo total" value={fmt(totalBalance)} color="bg-emerald-600" delay={0.05} />
                <StatCard icon={ArrowLeftRight} label="Transacciones" value="—" color="bg-zinc-700" delay={0.1} path="/transactions" />
                {role === 'ADMIN_ROLE' && (
                    <StatCard icon={Users} label="Usuarios" value={users.length} color="bg-violet-600" delay={0.15} path="/users" />
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <h2 className="text-white font-bold text-xl">Cuentas Recientes</h2>
                    <NavLink to="/accounts" className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors">
                        Ver todas →
                    </NavLink>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/3">
                                <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">Número</th>
                                <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">Tipo</th>
                                <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">Saldo</th>
                                <th className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-8 py-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {accounts.slice(0, 5).map((a) => (
                                <tr key={a._id} className="hover:bg-white/3 transition-colors">
                                    <td className="px-8 py-4 text-white font-mono text-sm">{a.numeroCuenta}</td>
                                    <td className="px-8 py-4 text-zinc-400 text-sm capitalize">{a.tipoCuenta}</td>
                                    <td className="px-8 py-4 text-white text-sm font-semibold">
                                        {new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(a.saldo || 0)}
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${a.estado ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700/40 text-zinc-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${a.estado ? 'bg-green-400' : 'bg-zinc-500'}`} />
                                            {a.estado ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {accounts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-zinc-500 text-sm">No hay cuentas aún.</td>
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