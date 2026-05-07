import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, Trash2, Plus, User as UserIcon, Shield, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useUserStore from '../store/userStore'
import UserForm from './UserForm'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'

const UserList = () => {
    const { users, loading, error, fetchUsers, deleteUser } = useUserStore()
    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [confirmId, setConfirmId] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleDelete = async () => {
        const toastId = toast.loading('Eliminando usuario...')
        try {
            await deleteUser(confirmId)
            setConfirmId(null)
            toast.success('Usuario eliminado correctamente', { id: toastId })
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error al eliminar el usuario', { id: toastId })
        }
    }

    const filtered = users.filter((u) => {
        const q = search.toLowerCase()
        return (
            (u.Username || u.username || '').toLowerCase().includes(q) ||
            (u.Email || u.email || '').toLowerCase().includes(q)
        )
    })

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
            {showForm && (
                <UserForm
                    user={editingUser}
                    onClose={() => {
                        setShowForm(false)
                        setEditingUser(null)
                        fetchUsers()
                    }}
                />
            )}

            {confirmId && (
                <ConfirmDialog
                    message="Esta acción eliminará el usuario permanentemente del sistema."
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Usuarios</h1>
                    <p className="text-zinc-500 text-sm mt-1">Gestiona los usuarios y sus roles en el sistema.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus size={18} />
                    Nuevo Usuario
                </button>
            </div>

            <div className="mb-4 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por usuario o correo..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                />
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
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Usuario</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Correo</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Rol</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5">Estado</th>
                                <th className="text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && users.length === 0 ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5"><Skeleton className="h-10 w-40 rounded-xl" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-5 w-48 rounded-lg" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        <td className="px-8 py-5"><Skeleton className="h-8 w-20 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-zinc-500">
                                        <UserIcon size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No se encontraron usuarios</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filtered.map((user) => {
                                        const username = user.Username || user.username || '—'
                                        const email = user.Email || user.email || '—'
                                        const role = user.roles?.[0] || 'USER_ROLE'
                                        const status = user.Status ?? user.status
                                        const id = user.Id || user.id || user._id
                                        return (
                                            <motion.tr
                                                key={id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-white/3 transition-colors"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
                                                            <UserIcon size={18} className="text-blue-400" />
                                                        </div>
                                                        <span className="text-white font-semibold text-sm">{username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-zinc-400 text-sm">{email}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${role === 'ADMIN_ROLE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-700/40 text-zinc-400 border-zinc-600/20'}`}>
                                                        <Shield size={11} />
                                                        {role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700/40 text-zinc-500'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-green-400' : 'bg-zinc-500'}`} />
                                                        {status ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={() => { setEditingUser(user); setShowForm(true) }}
                                                            className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmId(id)}
                                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
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

export default UserList