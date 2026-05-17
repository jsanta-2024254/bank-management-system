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
        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-zinc-800 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 text-zinc-400 hover:text-white lg:hidden transition-colors">
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block">
                    <p className="text-white font-bold">Panel de Control</p>
                </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
                <button className="p-2 text-zinc-500 hover:text-blue-400 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-zinc-950" />
                </button>

                <div className="h-8 w-px bg-zinc-800 hidden xs:block" />

                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-4 group cursor-pointer"
                    >
                        <div className="flex flex-col items-end md:flex">
                            <span className="text-white text-sm font-bold group-hover:text-blue-400 transition-colors">
                                {user?.username || 'Admin'}
                            </span>
                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter flex items-center gap-1">
                                {user?.role || 'Usuario'}
                                <ChevronDown size={10} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </span>                        </div>

                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 p-0.5 shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20 transition-all group-hover:scale-105">
                            <div className="w-full h-full rounded-[14px] bg-zinc-900 flex items-center justify-center">
                                <UserIcon size={20} className="text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-zinc-800 mb-2">
                                <p className="text-white text-sm font-bold truncate">{user?.email || user?.username}</p>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-0.5">Sesión activa</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-[calc(100%-1rem)] flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mx-2 rounded-2xl group"
                            >
                                <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <LogOut size={16} />
                                </div>
                                <span className="text-sm font-bold">Cerrar sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar