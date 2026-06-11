import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { KeyRound, Lock, ShieldCheck } from 'lucide-react'
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
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 px-5 py-3.5 text-sm font-semibold text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-3xl border border-[#d7bc73]/40 bg-white/38 p-6">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df] text-[#8a611b] shadow-[0_12px_24px_rgba(154,107,22,0.12)]">
                        <ShieldCheck size={22} />
                    </div>

                    <div>
                        <h3 className="text-lg font-black text-[#3f2c12]">
                            Cambiar contraseña
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-[#7a6849]">
                            Ingresa tu contraseña actual y confirma la nueva contraseña para proteger tu acceso.
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <label className={labelClass}>
                    <Lock size={11} />
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
                    <p className={errorClass}>
                        {errors.currentPassword.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>
                        <KeyRound size={11} />
                        Nueva contraseña
                    </label>

                    <input
                        {...register('newPassword', {
                            required: 'La nueva contraseña es requerida',
                            minLength: {
                                value: 8,
                                message:
                                    'La contraseña debe tener al menos 8 caracteres',
                            },
                        })}
                        type="password"
                        className={inputClass}
                        placeholder="Nueva contraseña"
                        disabled={isLoading}
                    />

                    {errors.newPassword && (
                        <p className={errorClass}>
                            {errors.newPassword.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>
                        <KeyRound size={11} />
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
                        <p className={errorClass}>
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-[#d7bc73]/45 bg-[#fff8df]/65 px-4 py-3 text-sm font-semibold leading-6 text-[#6f5a33]">
                Recomendación: usa una contraseña de al menos 8 caracteres, combinando letras, números y símbolos.
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] px-6 py-4 text-sm font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 sm:w-auto"
                >
                    <Lock size={18} />
                    {isLoading ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
            </div>
        </form>
    )
}

export default ChangePasswordForm