import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../../../shared/api/api'

const normalizeUser = (user) => {
    if (!user) return null

    const role =
        user.role ||
        user.Role ||
        user.roles?.[0] ||
        user.Roles?.[0] ||
        'USER_ROLE'

    return {
        ...user,
        role,
        roles: user.roles || user.Roles || [role],
    }
}

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (emailOrUsername, password) => {
                const response = await api.post('/auth/login', { emailOrUsername, password })
                const { token, userDetails } = response.data

                const normalizedUser = normalizeUser(userDetails)

                localStorage.setItem('token', token)
                set({
                    user: normalizedUser,
                    token,
                    isAuthenticated: true,
                })

                return normalizedUser
            },

            setUser: (user) => {
                set({ user: normalizeUser(user) })
            },

            logout: () => {
                localStorage.removeItem('token')
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                })
            },
        }),
        { name: 'bank-auth-storage' }
    )
)

export default useAuthStore