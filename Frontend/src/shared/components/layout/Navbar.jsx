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

    return (
        <header className="sticky top-0 z-40 border-b border-[#d7bc73]/38 bg-[#fff8ea]/68 px-4 py-3 shadow-[0_12px_40px_rgba(92,64,19,0.08)] backdrop-blur-2xl lg:px-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="rounded-2xl border border-[#d7bc73]/45 bg-white/45 p-2 text-[#8a611b] transition-all hover:bg-white/80 hover:text-[#3f2c12] lg:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden sm:block">
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#9a6b16]">
                            Panel de Control
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-[#7a6849]">
                            Gestión bancaria segura y elegante
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 lg:gap-5">
                    <button className="relative rounded-2xl border border-[#d7bc73]/38 bg-white/48 p-2.5 text-[#8a611b] shadow-[0_10px_24px_rgba(92,64,19,0.08)] transition-all hover:bg-white/85 hover:text-[#3f2c12]">
                        <Bell size={19} />
                        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#fff8ea] bg-[#b98219]" />
                    </button>

                    <div className="hidden h-9 w-px bg-[#d7bc73]/48 sm:block" />

                    <div className="relative" ref={dropdownRef}>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#d7bc73]/45 bg-white/48 px-2 py-2 shadow-[0_10px_28px_rgba(92,64,19,0.1)] transition-all hover:bg-white/85"
                        >
                            <div className="hidden flex-col items-end md:flex">
                                <span className="text-sm font-black text-[#3f2c12] transition-colors group-hover:text-[#8a611b]">
                                    {user?.username || 'Admin'}
                                </span>

                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#9a6b16]/70">
                                    {user?.role || 'Usuario'}
                                    <ChevronDown
                                        size={11}
                                        className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </span>
                            </div>

                            <div className="rounded-2xl bg-linear-to-br from-[#fff1bd] via-[#d9b45e] to-[#8a611b] p-0.5 shadow-[0_10px_26px_rgba(154,107,22,0.24)] transition-all group-hover:scale-105">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fff8ea]">
                                    <UserIcon size={20} className="text-[#8a611b]" />
                                </div>
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 origin-top-right animate-in rounded-3xl border border-[#d7bc73]/45 bg-[#fffaf0]/95 py-2 shadow-[0_24px_70px_rgba(92,64,19,0.22)] backdrop-blur-xl duration-200 fade-in zoom-in-95">
                                <div className="mb-2 border-b border-[#d7bc73]/35 px-4 py-3">
                                    <p className="truncate text-sm font-black text-[#3f2c12]">
                                        {user?.email || user?.username}
                                    </p>
                                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6b16]/70">
                                        Sesión activa
                                    </p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="group mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-2xl px-3 py-3 text-red-700 transition-colors hover:bg-red-50"
                                >
                                    <div className="rounded-xl bg-red-100 p-2 text-red-700 transition-colors group-hover:bg-red-700 group-hover:text-white">
                                        <LogOut size={16} />
                                    </div>

                                    <span className="text-sm font-black">Cerrar sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar