import { Landmark } from 'lucide-react'
import LoginForm from '../components/LoginForm'

const AuthPage = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-zinc-950 p-4"
            style={{ background: 'radial-gradient(ellipse at top, #1e293b 0%, #09090b 70%)' }}
        >
            <div className="fixed top-[-150px] right-[-150px] w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
            <div className="fixed bottom-[-150px] left-[-150px] w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />

            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-400 to-blue-700" />

                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Landmark className="text-white" size={24} />
                    </div>
                    <span className="text-white font-black text-2xl tracking-tighter">BankManager</span>
                </div>

                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-1">Bienvenido</h1>
                    <p className="text-zinc-500 text-sm">Ingresa tus credenciales para continuar</p>
                </div>

                <LoginForm />

                <p className="text-center text-zinc-600 text-xs mt-8">
                    © 2025 BankManager. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}

export default AuthPage