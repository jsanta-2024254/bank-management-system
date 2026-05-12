import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/authStore'
import AuthPage from '../../features/auth/pages/AuthPage'
import DashboardPage from '../layouts/DashboardPage'
import Dashboard from '../../features/dashboard/components/Dashboard'
import UserList from '../../features/users/components/UserList'
import AccountsPage from '../../features/accounts/pages/AccountsPage'
import TransactionList from '../../features/transactions/components/TransactionList'
import DepositList from '../../features/deposits/components/DepositList'
import ProfilePage from '../../features/profile/pages/ProfilePage'
import ProductList from '../../features/products/components/ProductList'
import FavoriteList from '../../features/favorites/components/FavoriteList'


const getUserRole = (user) => {
    return (
        user?.role ||
        user?.Role ||
        user?.roles?.[0] ||
        user?.Roles?.[0] ||
        'USER_ROLE'
    )
}

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    const role = getUserRole(user)

    if (role !== 'ADMIN_ROLE') {
        return <Navigate to="/accounts" replace />
    }

    return children
}

const ClientRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore()
    if (!isAuthenticated) return <Navigate to="/login" />
    if (user?.role !== 'USER_ROLE') return <Navigate to="/dashboard" />
    return children
}

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthPage />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="accounts" element={<AccountsPage />} />
                    <Route path="transactions" element={<TransactionList />} />

                    <Route
                        path="users"
                        element={
                            <AdminRoute>
                                <UserList />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="deposits"
                        element={
                            <AdminRoute>
                                <DepositList />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="products"
                        element={
                            <AdminRoute>
                                <ProductList />
                            </AdminRoute>
                        }
                    />
                    <Route
                    path="favorites"
                    element={
                        <ClientRoute>
                            <FavoriteList />
                        </ClientRoute>
                    }
                />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes