import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/authStore'
import AuthPage from '../../features/auth/pages/AuthPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import DashboardPage from '../layouts/DashboardPage'
import Dashboard from '../../features/dashboard/components/Dashboard'
import UserDashboard from '../../features/dashboard/components/UserDashboard'
import UserList from '../../features/users/components/UserList'
import AccountList from '../../features/accounts/components/AccountList'
import TransactionsPage from '../../features/transactions/pages/TransactionsPage'
import DepositList from '../../features/deposits/components/DepositList'
import ProfilePage from '../../features/profile/pages/ProfilePage'
import ProductList from '../../features/products/components/ProductList'
import ProductCatalogPage from '../../features/products/pages/ProductCatalogPage'
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

const DashboardSelector = () => {
    const { user } = useAuthStore()
    const role = getUserRole(user)
    return role === 'ADMIN_ROLE' ? <Dashboard /> : <UserDashboard />
}

const ProductSelector = () => {
    const { user } = useAuthStore()
    const role = getUserRole(user)
    return role === 'ADMIN_ROLE' ? (
        <AdminRoute>
            <ProductList />
        </AdminRoute>
    ) : (
        <ClientRoute>
            <ProductCatalogPage />
        </ClientRoute>
    )
}

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardSelector />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="accounts" element={<AccountList />} />
                    <Route path="transactions" element={<TransactionsPage />} />

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

                    <Route path="products" element={<ProductSelector />} />

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