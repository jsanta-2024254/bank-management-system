import { create } from 'zustand'
import { getUsers, createUser, updateUser, deleteUser } from '../../../shared/api/users'

const useUserStore = create((set) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async () => {
        set({ loading: true, error: null })
        try {
            const response = await getUsers()
            set({ users: response.data.users || response.data || [], loading: false })
        } catch (error) {
            set({ error: error.message, loading: false })
        }
    },

    createUser: async (data) => {
        const response = await createUser(data)
        set((state) => ({ users: [...state.users, response.data.user || response.data] }))
    },

    updateUser: async (id, data) => {
        const response = await updateUser(id, data)
        set((state) => ({
            users: state.users.map((u) => (u.Id === id || u.id === id ? response.data.user || response.data : u)),
        }))
    },

    deleteUser: async (id) => {
        await deleteUser(id)
        set((state) => ({ users: state.users.filter((u) => u.Id !== id && u.id !== id) }))
    },
}))

export default useUserStore