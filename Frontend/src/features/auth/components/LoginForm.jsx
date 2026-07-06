import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import useAuthStore from '../store/authStore'

const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm()

    const [showPassword, setShowPassword] = useState(false)
    const login = useAuthStore((state) => state.login)
    const navigate = useNavigate()

    const inputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-4 pl-12 pr-5 text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18'

    const passwordInputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-4 pl-12 pr-12 text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18'

    const labelClass =
        'mb-3 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

    const onSubmit = async (data) => {
        const toastId = toast.loading('Iniciando sesión...')

        try {
            const user = await login(data.email, data.password)
            const role = user?.roles?.[0]

            toast.success(`¡Bienvenido, ${user?.username || ''}!`, {
                id: toastId,
            })

            if (role === 'ADMIN_ROLE') {
                navigate('/dashboard')
            } else {
                navigate('/accounts')
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Credenciales incorrectas',
                { id: toastId }
            )
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 animate-in slide-in-from-bottom-4 duration-300"
        >
            <div>
                <label className={labelClass}>Usuario o correo</label>

                <div className="group relative">
                    <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70 transition-colors group-focus-within:text-[#7a4f0d]"
                    />

                    <input
                        {...register('email', {
                            required: 'Este campo es requerido',
                        })}
                        type="text"
                        placeholder="usuario o correo@ejemplo.com"
                        className={inputClass}
                    />
                </div>

                {errors.email && (
                    <p className={errorClass}>{errors.email.message}</p>
                )}
            </div>

            <div>
                <label className={labelClass}>Contraseña</label>

                <div className="group relative">
                    <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70 transition-colors group-focus-within:text-[#7a4f0d]"
                    />

                    <input
                        {...register('password', {
                            required: 'La contraseña es requerida',
                        })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={passwordInputClass}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-1 text-[#9a6b16]/70 transition-colors hover:bg-[#efe0bd]/70 hover:text-[#3f2c12]"
                    >
                        {showPassword ? (
                            <EyeOff size={15} />
                        ) : (
                            <Eye size={15} />
                        )}
                    </button>
                </div>

                {errors.password && (
                    <p className={errorClass}>{errors.password.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.34)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Iniciando sesión...</span>
                    </div>
                ) : (
                    'Iniciar sesión'
                )}
            </button>
        </form>
    )
}

export default LoginForm