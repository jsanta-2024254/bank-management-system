import { create } from 'zustand'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../../../shared/api/accounts'

const useAccountStore = create((set) => ({
    accounts: [],
    loading: false,
    error: null,

    fetchAccounts: async () => {
        set({ loading: true, error: null })
        try {
            const response = await getAccounts()
            set({ accounts: response.data.data || [], loading: false })
        } catch (error) {
            set({ error: error.message, loading: false })
        }
    },

    createAccount: async (data) => {
        const response = await createAccount(data)
        set((state) => ({ accounts: [...state.accounts, response.data.account || response.data] }))
    },

    updateAccount: async (id, data) => {
        const response = await updateAccount(id, data)
        set((state) => ({
            accounts: state.accounts.map((a) => (a._id === id ? response.data.account || response.data : a)),
        }))
    },

    deleteAccount: async (id) => {
        await deleteAccount(id)
        set((state) => ({ accounts: state.accounts.filter((a) => a._id !== id) }))
    },
}))

export default useAccountStore