import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import {
    getUsers,
    createUser as createUserRequest,
    updateUser as updateUserRequest,
    deleteUser as deleteUserRequest,
} from '../../../shared/api/users'

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    )
}

const getUserList = (response) => {
    return response?.data?.users || response?.data?.data || response?.data || []
}

const getUserItem = (response) => {
    return response?.data?.user || response?.data?.data || response?.data
}

const useUserStore = create((set) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async () => {
        set({ loading: true, error: null })

        try {
            const response = await getUsers()

            set({
                users: getUserList(response),
                loading: false,
                error: null,
            })
        } catch (error) {
            const message = getErrorMessage(error, 'Error al cargar los usuarios')

            set({
                error: message,
                loading: false,
                users: [],
            })

            toast.error(message)
        }
    },

    createUser: async (data) => {
        set({ loading: true, error: null })

        try {
            const response = await createUserRequest(data)
            const user = getUserItem(response)

            set((state) => ({
                users: user ? [...state.users, user] : state.users,
                loading: false,
                error: null,
            }))

            return user
        } catch (error) {
            const message = getErrorMessage(error, 'Error al crear el usuario')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    updateUser: async (id, data) => {
        set({ loading: true, error: null })

        try {
            const response = await updateUserRequest(id, data)
            const user = getUserItem(response)

            set((state) => ({
                users: state.users.map((u) =>
                    u.Id === id || u.id === id || u._id === id ? user : u
                ),
                loading: false,
                error: null,
            }))

            return user
        } catch (error) {
            const message = getErrorMessage(error, 'Error al actualizar el usuario')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    deleteUser: async (id) => {
        set({ loading: true, error: null })

        try {
            await deleteUserRequest(id)

            set((state) => ({
                users: state.users.filter(
                    (u) => u.Id !== id && u.id !== id && u._id !== id
                ),
                loading: false,
                error: null,
            }))
        } catch (error) {
            const message = getErrorMessage(error, 'Error al eliminar el usuario')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },
}))

export default useUserStore