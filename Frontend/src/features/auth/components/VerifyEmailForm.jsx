import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { authApi } from '../../../shared/api/auth'

const VerifyEmailForm = () => {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const token = params.get('token')

    const [status, setStatus] = useState('loading') // loading | success | error
    const [message, setMessage] = useState('')

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error')
                setMessage('El enlace no contiene un token válido.')
                return
            }

            try {
                await authApi.post('/auth/verify-email', { token })
                setStatus('success')
                setMessage('Tu correo fue verificado correctamente.')
            } catch (error) {
                setStatus('error')
                setMessage(
                    error?.response?.data?.message ||
                        'No se pudo verificar el correo. El enlace puede haber expirado.'
                )
            }
        }

        verify()
    }, [token])

    return (
        <div className="space-y-6 text-center animate-in slide-in-from-bottom-4 duration-300">
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <Loader2
                        size={40}
                        className="animate-spin text-[#8a611b]"
                    />
                    <p className="text-sm font-semibold text-[#7a6849]">
                        Verificando tu correo...
                    </p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <CheckCircle2 size={48} className="text-emerald-600" />
                    <p className="text-sm font-semibold text-[#3f2c12]">
                        {message}
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full rounded-2xl border border-[#c89b3c]/50 bg-linear-to-r from-[#b98219] via-[#d9b45e] to-[#8a611b] py-4 font-black text-white shadow-[0_18px_36px_rgba(154,107,22,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(154,107,22,0.34)]"
                    >
                        Ir a iniciar sesión
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <XCircle size={48} className="text-red-600" />
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-semibold text-red-700">
                        {message}
                    </div>
                    <Link
                        to="/login"
                        className="text-sm font-semibold text-[#7a6849] transition-colors hover:text-[#8a611b]"
                    >
                        Volver al login
                    </Link>
                </div>
            )}
        </div>
    )
}

export default VerifyEmailForm