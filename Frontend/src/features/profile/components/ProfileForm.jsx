import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Camera, User } from 'lucide-react'
import api from '../../../shared/api/api'
import useAuthStore from '../../auth/store/authStore'

const obtenerValorUsuario = (user, claves, valorPorDefecto = '') => {
    const valor = claves.find((clave) => user?.[clave] !== undefined && user?.[clave] !== null)
    return valor ? user[valor] : valorPorDefecto
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

const obtenerUsuarioActualizado = (response) => {
    return response.data?.data || response.data?.user || response.data
}

const ProfileForm = ({ user }) => {
    const [loading, setLoading] = useState(false)
    const [archivoImagen, setArchivoImagen] = useState(null)
    const setUser = useAuthStore((state) => state.setUser)

    const valoresIniciales = useMemo(
        () => ({
            name: obtenerValorUsuario(user, ['name', 'nombre', 'Name']),
            surname: obtenerValorUsuario(user, ['surname', 'apellido', 'Surname']),
            email: obtenerValorUsuario(user, ['email', 'Email']),
            phone: obtenerValorUsuario(user, ['phone', 'celular', 'Phone']),
            dpi: obtenerValorUsuario(user, ['dpi', 'Dpi']),
        }),
        [user]
    )

    const imagenPerfilActual = useMemo(() => obtenerImagenPerfil(user), [user])

    const previewImagen = useMemo(() => {
        if (!archivoImagen) {
            return imagenPerfilActual
        }

        return URL.createObjectURL(archivoImagen)
    }, [archivoImagen, imagenPerfilActual])

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: valoresIniciales })

    useEffect(() => {
        reset(valoresIniciales)
    }, [reset, valoresIniciales])

    useEffect(() => {
        if (!archivoImagen || !previewImagen?.startsWith('blob:')) {
            return undefined
        }

        return () => URL.revokeObjectURL(previewImagen)
    }, [archivoImagen, previewImagen])

    const isLoading = loading || isSubmitting

    const agregarCampoSiExiste = (formData, nombreCampo, valor) => {
        const texto = String(valor || '').trim()

        if (texto) {
            formData.append(nombreCampo, texto)
        }
    }

    const onSubmit = async (data) => {
        const toastId = toast.loading('Actualizando perfil...')
        setLoading(true)

        try {
            const formData = new FormData()
            agregarCampoSiExiste(formData, 'name', data.name)
            agregarCampoSiExiste(formData, 'surname', data.surname)
            agregarCampoSiExiste(formData, 'email', data.email)
            agregarCampoSiExiste(formData, 'phone', data.phone)
            agregarCampoSiExiste(formData, 'dpi', data.dpi)

            if (archivoImagen) {
                formData.append('profilePicture', archivoImagen)
            }

            const response = await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            const updatedUser = obtenerUsuarioActualizado(response)

            setUser(updatedUser)
            setArchivoImagen(null)
            toast.success('Perfil actualizado correctamente', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al actualizar perfil',
                { id: toastId }
            )
        } finally {
            setLoading(false)
        }
    }

    const manejarCambioImagen = (event) => {
        const file = event.target.files?.[0]

        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Debe seleccionar una imagen válida')
            event.target.value = ''
            return
        }

        setArchivoImagen(file)
    }

    const inputClass =
        'w-full bg-zinc-950/70 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed'

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-zinc-950/40 border border-zinc-800 rounded-3xl p-6">
                <div className="w-28 h-28 rounded-3xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                    {previewImagen ? (
                        <img
                            src={previewImagen}
                            alt="Foto de perfil"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={44} className="text-zinc-500" />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">Foto de perfil</h3>
                    <p className="text-zinc-500 text-sm mt-1 mb-4">
                        Seleccione una imagen para actualizar su fotografía de perfil.
                    </p>

                    <label className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-all">
                        <Camera size={18} />
                        Seleccionar imagen
                        <input
                            type="file"
                            accept="image/*"
                            onChange={manejarCambioImagen}
                            disabled={isLoading}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Nombre
                    </label>
                    <input
                        {...register('name', { required: 'El nombre es requerido' })}
                        className={inputClass}
                        placeholder="Nombre"
                        disabled={isLoading}
                    />
                    {errors.name && (
                        <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Apellido
                    </label>
                    <input
                        {...register('surname', { required: 'El apellido es requerido' })}
                        className={inputClass}
                        placeholder="Apellido"
                        disabled={isLoading}
                    />
                    {errors.surname && (
                        <p className="text-red-400 text-xs mt-1">{errors.surname.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Correo electrónico
                    </label>
                    <input
                        {...register('email', {
                            required: 'El correo es requerido',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Ingrese un correo válido',
                            },
                        })}
                        type="email"
                        className={inputClass}
                        placeholder="correo@ejemplo.com"
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Teléfono
                    </label>
                    <input
                        {...register('phone', {
                            pattern: {
                                value: /^\d{8}$/,
                                message: 'El teléfono debe tener exactamente 8 dígitos',
                            },
                        })}
                        type="tel"
                        className={inputClass}
                        placeholder="55555555"
                        disabled={isLoading}
                    />
                    {errors.phone && (
                        <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                    DPI
                </label>
                <input
                    {...register('dpi', {
                        pattern: {
                            value: /^\d{13}$/,
                            message: 'El DPI debe tener exactamente 13 dígitos',
                        },
                    })}
                    className={inputClass}
                    placeholder="1234567890101"
                    disabled={isLoading}
                />
                {errors.dpi && (
                    <p className="text-red-400 text-xs mt-1">{errors.dpi.message}</p>
                )}
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    )
}

export default ProfileForm