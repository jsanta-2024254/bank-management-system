import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/authStore'
import AuthPage from '../../features/auth/pages/AuthPage'
import DashboardPage from '../layouts/DashboardPage'
import Dashboard from '../../features/dashboard/components/Dashboard'
import UserList from '../../features/users/components/UserList'
import AccountList from '../../features/accounts/components/AccountList'
import TransactionList from '../../features/transactions/components/TransactionList'
import DepositList from '../../features/deposits/components/DepositList'
import ProfilePage from '../../features/profile/pages/ProfilePage'
import ProductList from '../../features/products/components/ProductList'
import FavoriteList from '../../features/favorites/components/FavoriteList'


const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore()
    if (!isAuthenticated) return <Navigate to="/login" />
    if (user?.role !== 'ADMIN_ROLE') return <Navigate to="/accounts" />
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
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="accounts" element={<AccountList />} />
                    <Route
                        path="users"
                        element={
                            <AdminRoute>
                                <UserList />
                            </AdminRoute>
                        }
                    />
                    <Route path="transactions" element={<TransactionList />} />
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

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes