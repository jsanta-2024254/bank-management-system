import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import {
    getAccounts,
    getMyAccounts,
    createAccount as createAccountRequest,
    updateAccount as updateAccountRequest,
    deleteAccount as deleteAccountRequest,
} from '../../../shared/api/accounts'

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    )
}

const getAccountList = (response) => {
    return response?.data?.data || response?.data?.accounts || response?.data || []
}

const getAccountItem = (response) => {
    return response?.data?.account || response?.data?.data || response?.data
}

const useAccountStore = create((set) => ({
    accounts: [],
    loading: false,
    error: null,

    fetchAccounts: async () => {
        set({ loading: true, error: null })

        try {
            const response = await getAccounts()

            set({
                accounts: getAccountList(response),
                loading: false,
                error: null,
            })
        } catch (error) {
            const message = getErrorMessage(error, 'Error al cargar las cuentas')

            set({
                error: message,
                loading: false,
                accounts: [],
            })

            toast.error(message)
        }
    },

    createAccount: async (data) => {
        set({ loading: true, error: null })

        try {
            const response = await createAccountRequest(data)
            const account = getAccountItem(response)

            set((state) => ({
                accounts: account ? [...state.accounts, account] : state.accounts,
                loading: false,
                error: null,
            }))

            return account
        } catch (error) {
            const message = getErrorMessage(error, 'Error al crear la cuenta')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    createMyAccount: async (data) => {
        set({ loading: true, error: null })

        try {
            const response = await createMyAccountRequest(data)
            const account = getAccountItem(response)

            set((state) => ({
                accounts: account ? [...state.accounts, account] : state.accounts,
                loading: false,
                error: null,
            }))

            return account
        } catch (error) {
            const message = getErrorMessage(error, 'Error al crear tu cuenta')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    updateAccount: async (id, data) => {
        set({ loading: true, error: null })

        try {
            const response = await updateAccountRequest(id, data)
            const account = getAccountItem(response)

            set((state) => ({
                accounts: state.accounts.map((a) =>
                    a._id === id || a.id === id || a.Id === id ? account : a
                ),
                loading: false,
                error: null,
            }))

            return account
        } catch (error) {
            const message = getErrorMessage(error, 'Error al actualizar la cuenta')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    deleteAccount: async (id) => {
        set({ loading: true, error: null })

        try {
             fetchMyAccounts: async (userId) => {
        set({ loading: true, error: null })
        try {
            const response = await getMyAccounts(userId)
            set({ accounts: getAccountList(response), loading: false, error: null })
        } catch (error) {
            const message = getErrorMessage(error, 'Error al cargar tus cuentas')
            set({ error: message, loading: false, accounts: [] })
            toast.error(message)
        }
    },
            await deleteAccountRequest(id)

            set((state) => ({
                accounts: state.accounts.filter(
                    (a) => a._id !== id && a.id !== id && a.Id !== id
                ),
                loading: false,
                error: null,
            }))
        } catch (error) {
            const message = getErrorMessage(error, 'Error al desactivar la cuenta')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },
}))

export default useAccountStore