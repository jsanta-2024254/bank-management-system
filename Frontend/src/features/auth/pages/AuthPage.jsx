import { Link } from 'react-router-dom'
import { Vault } from 'lucide-react'
import LoginForm from '../components/LoginForm'

const AuthPage = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 fondo-auth"
        >
            {/* Resplandor superior derecho */}
            <div
                className="fixed pointer-events-none"
                style={{
                    top: '-120px',
                    right: '-120px',
                    width: '480px',
                    height: '480px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(184,137,42,0.09) 0%, transparent 65%)',
                }}
            />

            {/* Resplandor inferior izquierdo */}
            <div
                className="fixed pointer-events-none"
                style={{
                    bottom: '-120px',
                    left: '-120px',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,99,24,0.07) 0%, transparent 65%)',
                }}
            />

            {/* Card principal */}
            <div
                className="w-full max-w-md relative overflow-hidden"
                style={{
                    backgroundColor: '#160f06',
                    border: '1px solid rgba(184,137,42,0.22)',
                    borderRadius: '20px',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(184,137,42,0.08)',
                    padding: '2.5rem',
                }}
            >
                {/* Línea dorada superior */}
                <div
                    className="absolute top-0 left-0 right-0"
                    style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, var(--oro-oscuro) 30%, var(--oro-claro) 50%, var(--oro-oscuro) 70%, transparent 100%)',
                    }}
                />

                {/* Resplandor interno sutil */}
                <div
                    className="absolute top-0 left-0 right-0 pointer-events-none"
                    style={{
                        height: '120px',
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(184,137,42,0.06) 0%, transparent 70%)',
                    }}
                />

                {/* Logo */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #b8892a 0%, #6b4a10 100%)',
                            boxShadow: '0 8px 32px rgba(184,137,42,0.35), 0 0 0 1px rgba(184,137,42,0.30)',
                        }}
                    >
                        <Vault size={30} style={{ color: '#0e0a05' }} />
                    </div>

                    <span
                        className="text-2xl tracking-wider"
                        style={{
                            fontFamily: 'var(--font-display)',
                            color: 'var(--oro-claro)',
                            fontWeight: 700,
                        }}
                    >
                        BankManager
                    </span>
                </div>

                {/* Título */}
                <div className="text-center mb-8">
                    <h1
                        className="text-xl font-bold mb-1.5"
                        style={{ color: 'var(--texto-blanco)', fontFamily: 'var(--font-body)' }}
                    >
                        Bienvenido
                    </h1>
                    <p
                        className="text-sm"
                        style={{ color: 'var(--texto-tenue)' }}
                    >
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                {/* Formulario */}
                <LoginForm />

                {/* Links */}
                <div className="text-center mt-5 space-y-3">
                    <div>
                        <Link
                            to="/forgot-password"
                            className="text-sm transition-colors"
                            style={{ color: 'var(--texto-tenue)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <div>
                        <Link
                            to="/register"
                            className="text-sm transition-colors"
                            style={{ color: 'var(--texto-tenue)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                        >
                            ¿No tienes cuenta?{' '}
                            <span style={{ color: 'var(--oro-medio)', fontWeight: 600 }}>
                                Regístrate
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8" style={{ borderTop: '1px solid rgba(184,137,42,0.08)', paddingTop: '1.25rem' }}>
                    <p
                        className="text-center text-xs"
                        style={{ color: 'var(--texto-muted)' }}
                    >
                        © 2025 BankManager. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AuthPage