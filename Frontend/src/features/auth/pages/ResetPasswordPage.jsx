import { Landmark } from 'lucide-react'
import ResetPasswordForm from '../components/ResetPasswordForm'

const ResetPasswordPage = () => {
    return (
        <div className="premium-marble-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-[#3b2a14]">
            <div className="pointer-events-none absolute -top-28 right-8 h-80 w-80 rounded-full bg-[#d9b45e]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-96 w-96 rounded-full bg-white/50 blur-3xl" />

            <div className="premium-marble-surface premium-soft-shadow relative w-full max-w-md overflow-hidden rounded-[2.25rem] border border-[#c89b3c]/45 p-8 sm:p-10">
                <div className="premium-gold-line absolute left-10 right-10 top-0 h-px" />
                <div className="premium-gold-line absolute bottom-0 left-10 right-10 h-px" />
                <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#d9b45e]/18 blur-3xl" />

                <div className="mb-9 flex items-center justify-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c89b3c]/50 bg-linear-to-br from-[#fff8df] via-[#ead190] to-[#9a6b16] shadow-[0_14px_30px_rgba(154,107,22,0.24)]">
                        <Landmark className="text-[#5b3a0d]" size={24} />
                    </div>

                    <div>
                        <span className="block text-2xl font-black tracking-tight text-[#3f2c12]">
                            BankManager
                        </span>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.26em] text-[#9a6b16]/70">
                            Seguridad
                        </span>
                    </div>
                </div>

                <div className="mb-7 text-center">
                    <h1 className="mb-1 text-3xl font-black tracking-tight text-[#3f2c12]">
                        Restablecer contraseña
                    </h1>

                    <p className="text-sm font-medium text-[#7a6849]">
                        Ingresa y confirma tu nueva contraseña
                    </p>
                </div>

                <ResetPasswordForm />

                <p className="mt-8 text-center text-xs font-medium text-[#9a8a6c]">
                    © 2026 BankManager. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}

export default ResetPasswordPage