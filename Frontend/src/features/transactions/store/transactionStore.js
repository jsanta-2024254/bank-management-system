import { create } from 'zustand'
import { getTransactions, createTransaction } from '../../../shared/api/transactions'

const useTransactionStore = create((set, get) => ({
    transactions: [],
    loading: false,
    error: null,
    currentAccountId: null,

    setCurrentAccountId: (id) => {
        set({ currentAccountId: id })
        if (id) get().fetchTransactions()
    },

    fetchTransactions: async () => {
        const { currentAccountId } = get()
        if (!currentAccountId) return

        set({ loading: true, error: null })
        try {
            const response = await getTransactions(currentAccountId)
            set({ transactions: response.data.data || [], loading: false })
        } catch (error) {
            set({ error: error.message, loading: false, transactions: [] })
        }
    },

    createTransaction: async (data) => {
        set({ loading: true, error: null })
        try {
            const response = await createTransaction(data)
            // Refresh transactions after a new one
            await get().fetchTransactions()
            set({ loading: false })
            return response.data
        } catch (error) {
            set({ error: error.message, loading: false })
            throw error
        }
    },
}))

export default useTransactionStore
