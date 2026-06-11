import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Camera, IdCard, Mail, Phone, Save, User } from 'lucide-react'
import api from '../../../shared/api/api'
import useAuthStore from '../../auth/store/authStore'

const obtenerValorUsuario = (user, claves, valorPorDefecto = '') => {
    const valor = claves.find(
        (clave) => user?.[clave] !== undefined && user?.[clave] !== null
    )
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
            surname: obtenerValorUsuario(user, [
                'surname',
                'apellido',
                'Surname',
            ]),
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
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-6">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#d7bc73]/45 bg-[#fff8df] shadow-[0_14px_32px_rgba(92,64,19,0.1)]">
                        {previewImagen ? (
                            <img
                                src={previewImagen}
                                alt="Foto de perfil"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User size={44} className="text-[#9a6b16]/65" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-black text-[#3f2c12]">
                            Foto de perfil
                        </h3>

                        <p className="mt-1 mb-4 text-sm leading-6 text-[#7a6849]">
                            Selecciona una imagen para actualizar tu fotografía de perfil.
                        </p>

                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-[#d7bc73]/55 bg-white/52 px-5 py-3 text-sm font-black text-[#6f5a33] shadow-[0_12px_26px_rgba(92,64,19,0.08)] transition-all hover:border-[#b98219]/60 hover:bg-[#fff8df] hover:text-[#3f2c12]">
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

                        {archivoImagen && (
                            <p className="mt-3 text-xs font-semibold text-[#8a6a3a]">
                                Imagen seleccionada: {archivoImagen.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>
                        <User size={11} />
                        Nombre
                    </label>

                    <input
                        {...register('name', {
                            required: 'El nombre es requerido',
                        })}
                        className={inputClass}
                        placeholder="Nombre"
                        disabled={isLoading}
                    />

                    {errors.name && (
                        <p className={errorClass}>{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <User size={11} />
                        Apellido
                    </label>

                    <input
                        {...register('surname', {
                            required: 'El apellido es requerido',
                        })}
                        className={inputClass}
                        placeholder="Apellido"
                        disabled={isLoading}
                    />

                    {errors.surname && (
                        <p className={errorClass}>{errors.surname.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>
                        <Mail size={11} />
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
                        <p className={errorClass}>{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <Phone size={11} />
                        Teléfono
                    </label>

                    <input
                        {...register('phone', {
                            pattern: {
                                value: /^\d{8}$/,
                                message:
                                    'El teléfono debe tener exactamente 8 dígitos',
                            },
                        })}
                        type="tel"
                        className={inputClass}
                        placeholder="55555555"
                        disabled={isLoading}
                    />

                    {errors.phone && (
                        <p className={errorClass}>{errors.phone.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className={labelClass}>
                    <IdCard size={11} />
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
                    <p className={errorClass}>{errors.dpi.message}</p>
                )}
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-6 py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 sm:w-auto"
                >
                    <Save size={18} />
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    )
}

export default ProfileForm