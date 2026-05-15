import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Lock } from 'lucide-react'
import api from '../../../shared/api/api'

const ChangePasswordForm = () => {
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const isLoading = loading || isSubmitting

    const onSubmit = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('La confirmación no coincide con la nueva contraseña')
            return
        }

        const toastId = toast.loading('Actualizando contraseña...')
        setLoading(true)

        try {
            await api.put('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            })

            reset()
            toast.success('Contraseña actualizada correctamente', { id: toastId })
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Error al cambiar contraseña',
                { id: toastId }
            )
        } finally {
            setLoading(false)
        }
    }

    const inputClass =
        'w-full bg-zinc-950/70 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed'

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-6 flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Lock className="text-blue-400" size={22} />
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg">Cambiar contraseña</h3>
                    <p className="text-zinc-500 text-sm mt-1">
                        Ingrese su contraseña actual y confirme la nueva contraseña.
                    </p>
                </div>
            </div>

            <div>
                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                    Contraseña actual
                </label>
                <input
                    {...register('currentPassword', {
                        required: 'La contraseña actual es requerida',
                    })}
                    type="password"
                    className={inputClass}
                    placeholder="Contraseña actual"
                    disabled={isLoading}
                />
                {errors.currentPassword && (
                    <p className="text-red-400 text-xs mt-1">
                        {errors.currentPassword.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Nueva contraseña
                    </label>
                    <input
                        {...register('newPassword', {
                            required: 'La nueva contraseña es requerida',
                            minLength: {
                                value: 8,
                                message: 'La contraseña debe tener al menos 8 caracteres',
                            },
                        })}
                        type="password"
                        className={inputClass}
                        placeholder="Nueva contraseña"
                        disabled={isLoading}
                    />
                    {errors.newPassword && (
                        <p className="text-red-400 text-xs mt-1">
                            {errors.newPassword.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                        Confirmar contraseña
                    </label>
                    <input
                        {...register('confirmPassword', {
                            required: 'Debe confirmar la nueva contraseña',
                            validate: (value, formValues) =>
                                value === formValues.newPassword ||
                                'Las contraseñas no coinciden',
                        })}
                        type="password"
                        className={inputClass}
                        placeholder="Confirmar contraseña"
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
            </div>
        </form>
    )
}

export default ChangePasswordForm