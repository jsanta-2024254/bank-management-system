import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import useAuthStore from '../store/authStore'

const LoginForm = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
    const [showPassword, setShowPassword] = useState(false)
    const login = useAuthStore((state) => state.login)
    const navigate = useNavigate()

    const onSubmit = async (data) => {
        const toastId = toast.loading('Iniciando sesión...')
        try {
            const user = await login(data.email, data.password)
            const role = user?.roles?.[0]
            toast.success(`¡Bienvenido, ${user?.username || ''}!`, { id: toastId })
            if (role === 'ADMIN_ROLE') {
                navigate('/dashboard')
            } else {
                navigate('/accounts')
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Credenciales incorrectas', { id: toastId })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* ── Campo: Usuario o correo ── */}
            <div>
                <label
                    className="block text-[10px] font-bold uppercase mb-2"
                    style={{
                        color: 'var(--texto-tenue)',
                        letterSpacing: '0.20em',
                        fontFamily: 'var(--font-body)',
                    }}
                >
                    Usuario o correo
                </label>
                <div className="relative">
                    <Mail
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--texto-tenue)' }}
                    />
                    <input
                        {...register('email', { required: 'Este campo es requerido' })}
                        type="text"
                        placeholder="usuario o correo@ejemplo.com"
                        className="input-premium w-full rounded-xl pl-11 pr-4 py-3.5 text-sm"
                        style={{ fontFamily: 'var(--font-body)' }}
                    />
                </div>
                {errors.email && (
                    <p className="text-xs mt-1.5 ml-1" style={{ color: 'var(--rojo-texto)' }}>
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* ── Campo: Contraseña ── */}
            <div>
                <label
                    className="block text-[10px] font-bold uppercase mb-2"
                    style={{
                        color: 'var(--texto-tenue)',
                        letterSpacing: '0.20em',
                        fontFamily: 'var(--font-body)',
                    }}
                >
                    Contraseña
                </label>
                <div className="relative">
                    <Lock
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--texto-tenue)' }}
                    />
                    <input
                        {...register('password', { required: 'La contraseña es requerida' })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="input-premium w-full rounded-xl pl-11 pr-12 py-3.5 text-sm"
                        style={{ fontFamily: 'var(--font-body)' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-colors"
                        style={{ color: 'var(--texto-tenue)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                    >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs mt-1.5 ml-1" style={{ color: 'var(--rojo-texto)' }}>
                        {errors.password.message}
                    </p>
                )}
            </div>

            {/* ── Botón submit ── */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="btn-oro w-full rounded-xl py-3.5 text-sm mt-2"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2.5">
                        <div
                            className="w-4 h-4 border-2 rounded-full animate-spin"
                            style={{
                                borderColor: 'rgba(14,10,5,0.3)',
                                borderTopColor: '#0e0a05',
                            }}
                        />
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