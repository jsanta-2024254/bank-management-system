import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/authStore'
import AuthPage from '../../features/auth/pages/AuthPage'
import DashboardPage from '../layouts/DashboardPage'
import Dashboard from '../../features/dashboard/components/Dashboard'
import UserList from '../../features/users/components/UserList'
import AccountList from '../../features/accounts/components/AccountList'
import TransactionList from '../../features/transactions/components/TransactionList'
import DepositList from '../../features/deposits/components/DepositList'

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
                    <Route path="products" element={<div className="text-white">Productos (próximamente)</div>} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes