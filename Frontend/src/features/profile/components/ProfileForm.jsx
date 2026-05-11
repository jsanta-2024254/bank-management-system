import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import Modal from '../../../shared/components/ui/Modal'
import api from '../../../shared/api/api'
import useAuthStore from '../../auth/store/authStore'

const ProfileForm = ({ user, onClose }) => {
    const [loading, setLoading] = useState(false)
    const setUser = useAuthStore((state) => state.setUser)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            nombre: user?.nombre || user?.name || user?.Name || '',
            apellido: user?.apellido || user?.surname || user?.Surname || '',
            celular: user?.celular || user?.phone || user?.Phone || '',
            direccion: user?.direccion || '',
            nombreTrabajo: user?.nombreTrabajo || '',
            ingresosMensuales: user?.ingresosMensuales || '',
        },
    })

    const isLoading = loading || isSubmitting

    const limpiarTexto = (valor) => {
        if (valor === undefined || valor === null) return undefined

        const texto = String(valor).trim()
        return texto === '' ? undefined : texto
    }

    const prepararDatos = (data) => {
        const datosPerfil = {
            nombre: limpiarTexto(data.nombre),
            apellido: limpiarTexto(data.apellido),
            celular: limpiarTexto(data.celular),
            direccion: limpiarTexto(data.direccion),
            nombreTrabajo: limpiarTexto(data.nombreTrabajo),
            ingresosMensuales: limpiarTexto(data.ingresosMensuales),
        }

        return Object.fromEntries(
            Object.entries(datosPerfil).filter(([, value]) => value !== undefined)
        )
    }

    const onSubmit = async (data) => {
        const toastId = toast.loading('Actualizando perfil...')

        setLoading(true)

        try {
            const datosPerfil = prepararDatos(data)
            const response = await api.put('/me', datosPerfil)
            const updatedUser = response.data?.data || response.data?.user || response.data

            setUser(updatedUser)

            toast.success('Perfil actualizado correctamente', { id: toastId })
            onClose()
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al actualizar perfil',
                { id: toastId }
            )
        } finally {
            setLoading(false)
        }
    }

    const inputClass =
        'w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm'

    return (
        <Modal title="Editar Perfil" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Nombre
                        </label>
                        <input
                            {...register('nombre', { required: 'El nombre es requerido' })}
                            className={inputClass}
                            placeholder="Nombre"
                            disabled={isLoading}
                        />
                        {errors.nombre && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.nombre.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Apellido
                        </label>
                        <input
                            {...register('apellido', { required: 'El apellido es requerido' })}
                            className={inputClass}
                            placeholder="Apellido"
                            disabled={isLoading}
                        />
                        {errors.apellido && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.apellido.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Celular
                    </label>
                    <input
                        {...register('celular', {
                            pattern: {
                                value: /^\d{8}$/,
                                message: 'El celular debe tener exactamente 8 dígitos',
                            },
                        })}
                        type="tel"
                        className={inputClass}
                        placeholder="55555555"
                        disabled={isLoading}
                    />
                    {errors.celular && (
                        <p className="text-red-400 text-xs mt-1">
                            {errors.celular.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Dirección
                    </label>
                    <input
                        {...register('direccion')}
                        className={inputClass}
                        placeholder="Dirección"
                        disabled={isLoading}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Lugar de trabajo
                        </label>
                        <input
                            {...register('nombreTrabajo')}
                            className={inputClass}
                            placeholder="Empresa / trabajo"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                            Ingresos mensuales
                        </label>
                        <input
                            {...register('ingresosMensuales', {
                                min: {
                                    value: 100,
                                    message: 'Los ingresos deben ser al menos Q100',
                                },
                            })}
                            type="number"
                            min="100"
                            step="0.01"
                            className={inputClass}
                            placeholder="5000"
                            disabled={isLoading}
                        />
                        {errors.ingresosMensuales && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.ingresosMensuales.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default ProfileForm