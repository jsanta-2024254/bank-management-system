import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Mail } from 'lucide-react'
import { authApi } from '../../../shared/api/auth'

const ForgotPasswordForm = () => {
    const [correoEnviado, setCorreoEnviado] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (data) => {
        try {
            await authApi.post('/auth/forgot-password', {
                email: data.email.trim(),
            })

            toast.success('Si el correo existe, recibirás un enlace')
            setCorreoEnviado(true)
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    'No se pudo procesar la solicitud'
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
                    Correo electrónico
                </label>

                <div className="relative group">
                    <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors"
                    />

                    <input
                        {...register('email', {
                            required: 'El correo es requerido',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Ingresa un correo válido',
                            },
                        })}
                        type="email"
                        placeholder="correo@ejemplo.com"
                        disabled={correoEnviado}
                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>

                {errors.email && (
                    <p className="text-red-400 text-xs mt-2 ml-1">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || correoEnviado}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Enviando enlace...</span>
                    </div>
                ) : correoEnviado ? (
                    'Enlace enviado'
                ) : (
                    'Enviar enlace'
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

export default ForgotPasswordForm