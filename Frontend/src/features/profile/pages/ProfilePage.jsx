import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Mail,
    Phone,
    Shield,
    IdCard,
    Lock,
    Info,
    RefreshCw,
} from 'lucide-react'
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
    const clave = claves.find(
        (nombreClave) =>
            user?.[nombreClave] !== undefined && user?.[nombreClave] !== null
    )
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
            toast.error(
                error?.response?.data?.message || 'Error al cargar el perfil'
            )
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
                    toast.error(
                        error?.response?.data?.message ||
                            'Error al cargar el perfil'
                    )
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
    const apellido = obtenerValorUsuario(user, [
        'surname',
        'apellido',
        'Surname',
    ])
    const fullName = `${nombre} ${apellido}`.trim()
    const username = obtenerValorUsuario(user, ['username', 'Username'], 'usuario')
    const email = obtenerValorUsuario(user, ['email', 'Email'], 'No registrado')
    const phone = obtenerValorUsuario(
        user,
        ['phone', 'celular', 'Phone'],
        'No registrado'
    )
    const dpi = obtenerValorUsuario(user, ['dpi', 'Dpi'], 'No registrado')
    const role = getUserRole(user)
    const profilePicture = obtenerImagenPerfil(user)

    const tabs = [
        { id: 'personal', label: 'Información Personal', icon: Info },
        { id: 'password', label: 'Cambiar Contraseña', icon: Lock },
    ]

    const infoCards = [
        {
            label: 'Correo',
            value: email,
            icon: Mail,
        },
        {
            label: 'Teléfono',
            value: phone,
            icon: Phone,
        },
        {
            label: 'DPI',
            value: dpi,
            icon: IdCard,
        },
        {
            label: 'Rol',
            value: role,
            icon: Shield,
        },
    ]

    return (
        <div className="pb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-5xl"
            >
                <div className="mb-8 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/62 px-6 py-6 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl md:px-8">
                    <div className="premium-gold-line mb-6 h-px w-full" />

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_18px_38px_rgba(154,107,22,0.24)]">
                                <User size={28} className="text-[#5b3a0d]" />
                            </div>

                            <div>
                                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a6b16]/75">
                                    Cuenta personal
                                </p>

                                <h1 className="text-3xl font-black tracking-tight text-[#3f2c12] md:text-4xl">
                                    Mi Perfil
                                </h1>

                                <p className="mt-1 text-sm font-semibold text-[#7a6849]">
                                    Gestiona tu información personal, foto de perfil y contraseña.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={cargarPerfil}
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d7bc73]/55 bg-white/52 px-5 py-3 text-sm font-black text-[#6f5a33] shadow-[0_12px_26px_rgba(92,64,19,0.08)] transition-all hover:border-[#b98219]/60 hover:bg-[#fff8df] hover:text-[#3f2c12] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? 'animate-spin' : ''}
                            />
                            {loading ? 'Actualizando...' : 'Actualizar datos'}
                        </button>
                    </div>
                </div>

                <div className="mb-6 overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl">
                    <div className="relative h-44 overflow-hidden border-b border-[#d7bc73]/35 bg-linear-to-r from-[#fff8df] via-[#ead190] to-[#b98219]">
                        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/40 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-[#8a611b]/18 blur-3xl" />
                        <div className="premium-gold-line absolute left-8 right-8 top-0 h-px" />

                        <div className="absolute -bottom-14 left-6 flex items-end gap-5 md:left-8">
                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-4xl border-4 border-[#fffaf0] bg-[#fff8df] shadow-[0_18px_38px_rgba(92,64,19,0.18)]">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt="Perfil"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-[#efe0bd]">
                                        <User size={46} className="text-[#9a6b16]" />
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-[#3f2c12]">
                                    {fullName || 'Usuario'}
                                </h2>

                                <p className="mt-1 text-sm font-bold text-[#6f5a33]">
                                    @{username}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-8 pt-20 md:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {infoCards.map((card) => {
                                const Icon = card.icon

                                return (
                                    <div
                                        key={card.label}
                                        className="rounded-3xl border border-[#d7bc73]/40 bg-white/42 p-5"
                                    >
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b]">
                                                <Icon size={17} />
                                            </div>

                                            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/70">
                                                {card.label}
                                            </span>
                                        </div>

                                        <p className="break-all text-sm font-black text-[#3f2c12]">
                                            {card.value}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-4xl border border-[#d7bc73]/45 bg-[#fffaf0]/68 shadow-[0_22px_60px_rgba(92,64,19,0.1)] backdrop-blur-xl">
                    <div className="border-b border-[#d7bc73]/35 p-2">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition-all ${
                                            isActive
                                                ? 'border border-[#c89b3c]/55 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] text-white shadow-[0_14px_28px_rgba(154,107,22,0.22)]'
                                                : 'border border-transparent text-[#6f5a33] hover:border-[#d7bc73]/45 hover:bg-white/55 hover:text-[#3f2c12]'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
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