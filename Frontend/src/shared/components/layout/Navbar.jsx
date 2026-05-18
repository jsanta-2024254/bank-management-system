import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../features/auth/store/authStore'
import { User as UserIcon, Bell, LogOut, ChevronDown, Menu } from 'lucide-react'

const Navbar = ({ onMenuClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()
    const logout = useAuthStore((state) => state.logout)
    const user = useAuthStore((state) => state.user)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const iniciales = (user?.username || user?.email || 'U')
        .slice(0, 2)
        .toUpperCase()

    return (
        <header
            className="px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-40"
            style={{
                backgroundColor: 'rgba(14, 10, 5, 0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(184, 137, 42, 0.15)',
            }}
        >
            {/* ── Izquierda: botón menú + título ── */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg lg:hidden transition-colors"
                    style={{ color: 'var(--texto-tenue)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                >
                    <Menu size={22} />
                </button>

                <div className="hidden sm:flex flex-col">
                    <span
                        className="text-sm font-bold tracking-widest uppercase"
                        style={{
                            color: 'var(--texto-tenue)',
                            fontFamily: 'var(--font-body)',
                            letterSpacing: '0.15em',
                        }}
                    >
                        Panel de Control
                    </span>
                    <div
                        className="h-px w-full mt-0.5"
                        style={{
                            background: 'linear-gradient(90deg, var(--oro-oscuro), transparent)',
                        }}
                    />
                </div>
            </div>

            {/* ── Derecha: campana + perfil ── */}
            <div className="flex items-center gap-4">

                {/* Campana */}
                <button
                    className="relative p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--texto-tenue)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--oro-claro)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--texto-tenue)'}
                >
                    <Bell size={18} />
                    <span
                        className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--oro-medio)' }}
                    />
                </button>

                {/* Separador */}
                <div
                    className="hidden sm:block h-6 w-px"
                    style={{ backgroundColor: 'rgba(184,137,42,0.15)' }}
                />

                {/* Avatar + dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 group"
                    >
                        {/* Texto usuario */}
                        <div className="hidden md:flex flex-col items-end">
                            <span
                                className="text-sm font-semibold transition-colors"
                                style={{
                                    color: 'var(--texto-blanco)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                {user?.username || 'Usuario'}
                            </span>
                            <span
                                className="text-[10px] uppercase tracking-widest flex items-center gap-1"
                                style={{ color: 'var(--texto-tenue)' }}
                            >
                                {user?.roles?.[0] === 'ADMIN_ROLE' ? 'Admin' : 'Cliente'}
                                <ChevronDown
                                    size={9}
                                    style={{
                                        transition: 'transform 0.2s',
                                        transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    }}
                                />
                            </span>
                        </div>

                        {/* Avatar con iniciales */}
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #b8892a 0%, #8a6318 100%)',
                                color: '#0e0a05',
                                boxShadow: isDropdownOpen
                                    ? '0 0 0 2px var(--oro-claro), 0 4px 16px rgba(184,137,42,0.30)'
                                    : '0 2px 8px rgba(184,137,42,0.20)',
                                fontFamily: 'var(--font-display)',
                                fontSize: '11px',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {iniciales}
                        </div>
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div
                            className="absolute right-0 mt-3 w-60 py-2 rounded-2xl shadow-2xl"
                            style={{
                                backgroundColor: '#160f06',
                                border: '1px solid rgba(184,137,42,0.22)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(184,137,42,0.10)',
                                animation: 'fadeSlideUp 0.15s ease forwards',
                            }}
                        >
                            {/* Info usuario */}
                            <div
                                className="px-4 py-3 mb-1"
                                style={{ borderBottom: '1px solid rgba(184,137,42,0.12)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{
                                            background: 'linear-gradient(135deg, #b8892a 0%, #8a6318 100%)',
                                            color: '#0e0a05',
                                            fontFamily: 'var(--font-display)',
                                        }}
                                    >
                                        {iniciales}
                                    </div>
                                    <div className="min-w-0">
                                        <p
                                            className="text-sm font-semibold truncate"
                                            style={{ color: 'var(--texto-blanco)' }}
                                        >
                                            {user?.username || 'Usuario'}
                                        </p>
                                        <p
                                            className="text-[10px] truncate"
                                            style={{ color: 'var(--texto-tenue)' }}
                                        >
                                            {user?.email || ''}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest"
                                    style={{
                                        backgroundColor: 'rgba(184,137,42,0.12)',
                                        color: 'var(--oro-medio)',
                                        border: '1px solid rgba(184,137,42,0.20)',
                                    }}
                                >
                                    Sesión activa
                                </div>
                            </div>

                            {/* Botón cerrar sesión */}
                            <div className="px-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                                    style={{ color: 'var(--texto-tenue)' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = 'rgba(200,60,60,0.08)'
                                        e.currentTarget.style.color = '#c87a7a'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = ''
                                        e.currentTarget.style.color = 'var(--texto-tenue)'
                                    }}
                                >
                                    <LogOut size={15} style={{ flexShrink: 0 }} />
                                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                                        Cerrar sesión
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar