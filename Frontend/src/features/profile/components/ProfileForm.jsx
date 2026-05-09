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
            name: user?.name || user?.Name || '',
            surname: user?.surname || user?.Surname || '',
            phone: user?.phone || user?.Phone || '',
        },
    })

    const isLoading = loading || isSubmitting

    const onSubmit = async (data) => {
        const toastId = toast.loading('Actualizando perfil...')

        setLoading(true)

        try {
            const response = await api.put('/users/me', data)
            const updatedUser = response.data?.user || response.data?.data || response.data

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
                            {...register('name', { required: 'El nombre es requerido' })}
                            className={inputClass}
                            placeholder="Nombre"
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.name.message}
                            </p>
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
                            <p className="text-red-400 text-xs mt-1">
                                {errors.surname.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Teléfono
                    </label>
                    <input
                        {...register('phone')}
                        type="tel"
                        className={inputClass}
                        placeholder="+502 1234 5678"
                        disabled={isLoading}
                    />
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