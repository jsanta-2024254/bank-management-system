import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Edit3, Camera } from 'lucide-react'
import useAuthStore from '../../auth/store/authStore'
import ProfileForm from '../components/ProfileForm'

const ProfilePage = () => {
    const { user } = useAuthStore()
    const [showEditForm, setShowEditForm] = useState(false)

    const fullName = `${user?.name || user?.Name || ''} ${user?.surname || user?.Surname || ''}`.trim()

    return (
        <div className="pb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">Mi Perfil</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gestiona tu información personal</p>
                    </div>
                    <button
                        onClick={() => setShowEditForm(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                    >
                        <Edit3 size={18} />
                        Editar Perfil
                    </button>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                            <div className="w-28 h-28 rounded-3xl border-4 border-zinc-900 bg-zinc-800 overflow-hidden flex items-center justify-center">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="Perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                                        <User size={48} className="text-zinc-400" />
                                    </div>
                                )}
                            </div>
                            <div className="mb-4">
                                <h2 className="text-2xl font-bold text-white">{fullName || 'Usuario'}</h2>
                                <p className="text-zinc-400">@{user?.username || user?.Username}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Mail className="text-blue-400" size={20} />
                                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Correo Electrónico</span>
                                </div>
                                <p className="text-white text-lg">{user?.email || user?.Email || 'No registrado'}</p>
                            </div>

                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Phone className="text-emerald-400" size={20} />
                                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Teléfono</span>
                                </div>
                                <p className="text-white text-lg">
                                    {user?.phone || user?.Phone || 'No registrado'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <User className="text-violet-400" size={20} />
                                <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Rol</span>
                            </div>
                            <p className="text-white font-semibold">
                                {user?.role || user?.roles?.[0] || 'USER_ROLE'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {showEditForm && (
                <ProfileForm
                    user={user}
                    onClose={() => setShowEditForm(false)}
                />
            )}
        </div>
    )
}

export default ProfilePage