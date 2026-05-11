import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import {
    getTransactions,
    createTransaction as createTransactionRequest,
} from '../../../shared/api/transactions'

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    )
}

const getTransactionList = (response) => {
    return response?.data?.data || response?.data?.transactions || response?.data || []
}

const useTransactionStore = create((set, get) => ({
    transactions: [],
    loading: false,
    error: null,
    currentAccountId: null,

    setCurrentAccountId: (id) => {
        set({ currentAccountId: id })

        if (!id) {
            set({ transactions: [] })
            return
        }

        get().fetchTransactions(id)
    },

    fetchTransactions: async (accountId) => {
        const id = accountId || get().currentAccountId

        if (!id) {
            set({ transactions: [], error: null })
            return
        }

        set({ loading: true, error: null })

        try {
            const response = await getTransactions(id)

            set({
                transactions: getTransactionList(response),
                loading: false,
                error: null,
            })
        } catch (error) {
            const message = getErrorMessage(error, 'Error al cargar las transacciones')

            set({
                error: message,
                loading: false,
                transactions: [],
            })

            toast.error(message)
        }
    },

    createTransaction: async (data) => {
        set({ loading: true, error: null })

        try {
            const response = await createTransactionRequest(data)
            await get().fetchTransactions()

            set({
                loading: false,
                error: null,
            })

            return response.data
        } catch (error) {
            const message = getErrorMessage(error, 'Error al realizar la transferencia')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },
}))

export default useTransactionStore