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
                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block opacity-70">
                    Nueva contraseña
                </label>

                <div className="relative group">
                    <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                    />

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
                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />

                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                    >
                        {showNewPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                </div>

                {errors.newPassword && (
                    <p className="text-red-400 text-xs mt-2 ml-1">
                        {errors.newPassword.message}
                    </p>
                )}
            </div>

            <div>
                <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block opacity-70">
                    Confirmar contraseña
                </label>

                <div className="relative group">
                    <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                    />

                    <input
                        {...register('confirmPassword', {
                            required: 'Confirma tu contraseña',
                            validate: (value) =>
                                value === getValues('newPassword') ||
                                'Las contraseñas no coinciden',
                        })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                </div>

                {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-2 ml-1">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            {!token && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl p-4">
                    El enlace de recuperación no contiene un token válido.
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !token}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Actualizando contraseña...</span>
                    </div>
                ) : (
                    'Actualizar contraseña'
                )}
            </button>

            <div className="text-center">
                <Link
                    to="/login"
                    className="text-sm text-zinc-400 hover:text-blue-400 transition-colors"
                >
                    Volver al login
                </Link>
            </div>
        </form>
    )
}

export default ResetPasswordForm