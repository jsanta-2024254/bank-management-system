import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Shield, IdCard, Lock, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../../shared/api/api'
import useAuthStore from '../../auth/store/authStore'
import ProfileForm from '../components/ProfileForm'
import ChangePasswordForm from '../components/ChangePasswordForm'

const obtenerPerfilDesdeApi = async () => {
    const response = await api.get('/auth/profile')
    return response.data?.data || response.data?.user || response.data
}

const obtenerValorUsuario = (user, claves, valorPorDefecto = '') => {
    const clave = claves.find((nombreClave) => user?.[nombreClave] !== undefined && user?.[nombreClave] !== null)
    return clave ? user[clave] : valorPorDefecto
}

const obtenerImagenPerfil = (user) => {
    return (
        user?.profilePicture ||
        user?.profileImage ||
        user?.ProfilePicture ||
        user?.avatar ||
        ''
    )
}

const getUserRole = (user) => {
    return (
        user?.role ||
        user?.Role ||
        user?.roles?.[0] ||
        user?.Roles?.[0] ||
        'USER_ROLE'
    )
}

const ProfilePage = () => {
    const { user, setUser } = useAuthStore()
    const [activeTab, setActiveTab] = useState('personal')
    const [loading, setLoading] = useState(true)

    const cargarPerfil = useCallback(async () => {
        setLoading(true)

        try {
            const perfil = await obtenerPerfilDesdeApi()
            setUser(perfil)
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error al cargar el perfil')
        } finally {
            setLoading(false)
        }
    }, [setUser])

    useEffect(() => {
        let estaMontado = true

        const cargarPerfilInicial = async () => {
            try {
                const perfil = await obtenerPerfilDesdeApi()

                if (estaMontado) {
                    setUser(perfil)
                }
            } catch (error) {
                if (estaMontado) {
                    toast.error(error?.response?.data?.message || 'Error al cargar el perfil')
                }
            } finally {
                if (estaMontado) {
                    setLoading(false)
                }
            }
        }

        cargarPerfilInicial()

        return () => {
            estaMontado = false
        }
    }, [setUser])

    const nombre = obtenerValorUsuario(user, ['name', 'nombre', 'Name'])
    const apellido = obtenerValorUsuario(user, ['surname', 'apellido', 'Surname'])
    const fullName = `${nombre} ${apellido}`.trim()
    const username = obtenerValorUsuario(user, ['username', 'Username'], 'usuario')
    const email = obtenerValorUsuario(user, ['email', 'Email'], 'No registrado')
    const phone = obtenerValorUsuario(user, ['phone', 'celular', 'Phone'], 'No registrado')
    const dpi = obtenerValorUsuario(user, ['dpi', 'Dpi'], 'No registrado')
    const role = getUserRole(user)
    const profilePicture = obtenerImagenPerfil(user)

    const tabs = [
        { id: 'personal', label: 'Información Personal', icon: Info },
        { id: 'password', label: 'Cambiar Contraseña', icon: Lock },
    ]

    return (
        <div className="pb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">Mi Perfil</h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Gestiona tu información personal, foto de perfil y contraseña.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={cargarPerfil}
                        disabled={loading}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Actualizando...' : 'Actualizar datos'}
                    </button>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden mb-6">
                    <div className="h-40 bg-linear-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                            <div className="w-28 h-28 rounded-3xl border-4 border-zinc-900 bg-zinc-800 overflow-hidden flex items-center justify-center">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
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
                                <h2 className="text-2xl font-bold text-white">
                                    {fullName || 'Usuario'}
                                </h2>
                                <p className="text-zinc-400">@{username}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <Mail className="text-blue-400" size={18} />
                                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        Correo
                                    </span>
                                </div>
                                <p className="text-white font-semibold break-all">{email}</p>
                            </div>

                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <Phone className="text-emerald-400" size={18} />
                                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        Teléfono
                                    </span>
                                </div>
                                <p className="text-white font-semibold">{phone}</p>
                            </div>

                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <IdCard className="text-yellow-400" size={18} />
                                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        DPI
                                    </span>
                                </div>
                                <p className="text-white font-semibold">{dpi}</p>
                            </div>

                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <Shield className="text-violet-400" size={18} />
                                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        Rol
                                    </span>
                                </div>
                                <p className="text-white font-semibold">{role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-2 p-2 border-b border-zinc-800">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'personal' && <ProfileForm user={user} />}
                        {activeTab === 'password' && <ChangePasswordForm />}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default ProfilePage