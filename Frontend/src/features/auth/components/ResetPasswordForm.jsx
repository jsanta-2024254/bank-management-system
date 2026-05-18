import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { authApi } from '../../../shared/api/auth'

const ResetPasswordForm = () => {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const token = params.get('token')

    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    })

    const passwordInputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-4 pl-12 pr-12 text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18'

    const labelClass =
        'mb-3 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    const iconClass =
        'absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70 transition-colors group-focus-within:text-[#7a4f0d]'

    const eyeButtonClass =
        'absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-1 text-[#9a6b16]/70 transition-colors hover:bg-[#efe0bd]/70 hover:text-[#3f2c12]'

    const onSubmit = async (data) => {
        if (!token) {
            toast.error('El enlace no contiene un token válido')
            return
        }

        try {
            await authApi.post('/auth/reset-password', {
                token,
                newPassword: data.newPassword,
            })

            toast.success('Contraseña actualizada')
            navigate('/login')
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'No se pudo actualizar la contraseña'
            )
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 animate-in slide-in-from-bottom-4 duration-300"
        >
            <div>
                <label className={labelClass}>Nueva contraseña</label>

                <div className="group relative">
                    <Lock size={18} className={iconClass} />

                    <input
                        {...register('newPassword', {
                            required: 'La nueva contraseña es requerida',
                            minLength: {
                                value: 8,
                                message: 'Mínimo 8 caracteres',
                            },
                        })}
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={passwordInputClass}
                    />

                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={eyeButtonClass}
                    >
                        {showNewPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                </div>

                {errors.newPassword && (
                    <p className={errorClass}>{errors.newPassword.message}</p>
                )}
            </div>

            <div>
                <label className={labelClass}>Confirmar contraseña</label>

                <div className="group relative">
                    <Lock size={18} className={iconClass} />

                    <input
                        {...register('confirmPassword', {
                            required: 'Confirma tu contraseña',
                            validate: (value) =>
                                value === getValues('newPassword') ||
                                'Las contraseñas no coinciden',
                        })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={passwordInputClass}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={eyeButtonClass}
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                </div>

                {errors.confirmPassword && (
                    <p className={errorClass}>
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            {!token && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-semibold text-red-700">
                    El enlace de recuperación no contiene un token válido.
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !token}
                className="w-full rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.34)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Actualizando contraseña...</span>
                    </div>
                ) : (
                    'Actualizar contraseña'
                )}
            </button>

            <div className="text-center">
                <Link
                    to="/login"
                    className="text-sm font-semibold text-[#7a6849] transition-colors hover:text-[#8a611b]"
                >
                    Volver al login
                </Link>
            </div>
        </form>
    )
}

export default ResetPasswordForm