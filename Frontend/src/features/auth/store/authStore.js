import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../../../shared/api/api'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (emailOrUsername, password) => {
                const response = await api.post('/auth/login', { emailOrUsername, password })
                const { token, user } = response.data
                localStorage.setItem('token', token)
                set({ user, token, isAuthenticated: true })
                return user
            },

            logout: () => {
                localStorage.removeItem('token')
                set({ user: null, token: null, isAuthenticated: false })
            },
        }),
        { name: 'bank-auth-storage' }
    )
)

export default useAuthStore