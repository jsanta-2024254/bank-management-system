import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Edit3,
    Trash2,
    Plus,
    User as UserIcon,
    Shield,
    Search,
    Users,
    Mail,
} from 'lucide-react'
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
            toast.error(
                error?.response?.data?.message ||
                    'Error al eliminar el usuario',
                { id: toastId }
            )
        }
    }

    const filtered = (users || []).filter((u) => {
        const q = search.toLowerCase()

        return (
            (u.Username || u.username || '').toLowerCase().includes(q) ||
            (u.Email || u.email || '').toLowerCase().includes(q) ||
            (u.nombre || '').toLowerCase().includes(q) ||
            (u.apellido || '').toLowerCase().includes(q)
        )
    })

    const totalUsuarios = users.length

    const usuariosActivos = users.filter((user) => {
        const status = user.Status ?? user.status ?? user.estado
        return Boolean(status)
    }).length

    const usuariosAdmin = users.filter((user) => {
        const role = user.role || user.Role || user.roles?.[0] || 'USER_ROLE'
        return role === 'ADMIN_ROLE'
    }).length

    const confirmTarget = users.find((user) => {
        const id = user.Id || user.id || user._id
        return id === confirmId
    })

    const Skeleton = ({ className }) => (
        <div className={`animate-pulse bg-[#ead9ad]/70 ${className}`} />
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-10"
        >
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
                    message={
                        confirmTarget
                            ? `Esta acción desactivará el usuario "${confirmTarget.Username || confirmTarget.username || 'seleccionado'}" y sus cuentas asociadas.`
                            : 'Esta acción desactivará el usuario y sus cuentas asociadas.'
                    }
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}

            <div className="mb-8 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                <div className="premium-gold-line mb-6 h-px w-full" />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                            <Users size={28} className="text-[#5b3a0d]" />
                        </div>

                        <div>
                            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                Administración del sistema
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                Usuarios
                            </h1>

                            <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                Gestiona los usuarios y sus roles en el sistema.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setEditingUser(null)
                            setShowForm(true)
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] active:scale-95 sm:w-auto"
                    >
                        <Plus size={18} />
                        Nuevo Usuario
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Total usuarios
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {totalUsuarios}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Usuarios activos
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {usuariosActivos}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                            Administradores
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#3f2c12]">
                            {usuariosAdmin}
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative mb-6">
                <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70"
                />

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por usuario, correo, nombre o apellido..."
                    className="w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-3.5 pl-10 pr-4 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18"
                />
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-center text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            <div className="relative overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl">
                <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                <div className="custom-scrollbar overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#d7bc73]/28 bg-[#ead9ad]/22">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Usuario
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Correo
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Rol
                                </th>

                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Estado
                                </th>

                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#d7bc73]/28">
                            {loading && users.length === 0 ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5">
                                            <Skeleton className="h-10 w-40 rounded-xl" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-5 w-48 rounded-lg" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </td>

                                        <td className="px-8 py-5">
                                            <Skeleton className="ml-auto h-8 w-20 rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-8 py-16 text-center text-[#8a6a3a]"
                                    >
                                        <UserIcon
                                            size={34}
                                            className="mx-auto mb-3 opacity-40"
                                        />

                                        <p className="font-bold">
                                            No se encontraron usuarios
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filtered.map((user) => {
                                        const username =
                                            user.Username || user.username || '—'
                                        const email = user.Email || user.email || '—'
                                        const role =
                                            user.role ||
                                            user.Role ||
                                            user.roles?.[0] ||
                                            'USER_ROLE'
                                        const status =
                                            user.Status ??
                                            user.status ??
                                            user.estado
                                        const id = user.Id || user.id || user._id

                                        return (
                                            <motion.tr
                                                key={id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="transition-colors hover:bg-white/35"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                                                            <UserIcon size={17} />
                                                        </div>

                                                        <div>
                                                            <span className="block text-sm font-black text-[#3f2c12]">
                                                                {username}
                                                            </span>

                                                            {(user.nombre ||
                                                                user.apellido) && (
                                                                <span className="mt-0.5 block text-xs font-semibold text-[#8a6a3a]">
                                                                    {user.nombre}{' '}
                                                                    {user.apellido}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#7a6849]">
                                                        <Mail
                                                            size={14}
                                                            className="text-[#9a6b16]/70"
                                                        />
                                                        {email}
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
                                                            role === 'ADMIN_ROLE'
                                                                ? 'border-[#d7bc73]/50 bg-[#fff8df] text-[#8a611b]'
                                                                : 'border-[#d7bc73]/40 bg-white/45 text-[#6f5a33]'
                                                        }`}
                                                    >
                                                        <Shield size={11} />
                                                        {role}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
                                                            status
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                : 'border-[#d7bc73]/40 bg-[#ead9ad]/35 text-[#8a6a3a]'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                status
                                                                    ? 'bg-emerald-600'
                                                                    : 'bg-[#9a6b16]'
                                                            }`}
                                                        />
                                                        {status ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(user)
                                                                setShowForm(true)
                                                            }}
                                                            className="rounded-xl border border-[#d7bc73]/45 bg-white/50 p-2 text-[#8a611b] transition-all hover:bg-[#fff8df] hover:text-[#3f2c12]"
                                                            title="Editar usuario"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setConfirmId(id)
                                                            }
                                                            className="rounded-xl border border-red-200 bg-red-50/80 p-2 text-red-700 transition-all hover:bg-red-100"
                                                            title="Eliminar usuario"
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