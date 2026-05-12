import AccountList from '../components/AccountList'
import useAuthStore from '../../auth/store/authStore'
import { CreditCard } from 'lucide-react'

const AccountsPage = () => {
    const { user } = useAuthStore()
    const role = user?.role || user?.Role || user?.roles?.[0] || 'USER_ROLE'
    const isAdmin = role === 'ADMIN_ROLE'

    return (
        <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
                <span>Inicio</span>
                <span>/</span>
                <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                    <CreditCard size={12} />
                    {isAdmin ? 'Cuentas Bancarias' : 'Mis Cuentas'}
                </span>
            </div>
            <AccountList />
        </div>
    )
}

export default AccountsPage