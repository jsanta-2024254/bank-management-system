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

    const inputClass =
        'w-full rounded-2xl border border-[#d7bc73]/50 bg-white/58 py-4 pl-12 pr-5 text-[#3b2a14] placeholder-[#a89365] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-all focus:border-[#b98219]/70 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#d9b45e]/18 disabled:cursor-not-allowed disabled:opacity-60'

    const labelClass =
        'mb-3 block text-[10px] font-black uppercase tracking-[0.24em] text-[#8a611b]/75'

    const errorClass = 'mt-2 ml-1 text-xs font-semibold text-red-700'

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
                <label className={labelClass}>Correo electrónico</label>

                <div className="group relative">
                    <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a6b16]/70 transition-colors group-focus-within:text-[#7a4f0d]"
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
                        className={inputClass}
                    />
                </div>

                {errors.email && (
                    <p className={errorClass}>{errors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || correoEnviado}
                className="w-full rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.34)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            >
                {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
                    className="text-sm font-semibold text-[#7a6849] transition-colors hover:text-[#8a611b]"
                >
                    Volver al login
                </Link>
            </div>
        </form>
    )
}

export default ForgotPasswordForm