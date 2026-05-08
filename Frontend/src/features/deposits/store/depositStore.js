import { create } from 'zustand'
import { getDeposits, createDeposit } from '../../../shared/api/deposits'

const useDepositStore = create((set, get) => ({
    deposits: [],
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10
    },

    fetchDeposits: async (page = 1, limit = 10) => {
        set({ loading: true, error: null })
        try {
            const response = await getDeposits({ page, limit })
            set({ 
                deposits: response.data.data || [], 
                pagination: {
                    total: response.data.total || 0,
                    page,
                    limit
                },
                loading: false 
            })
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message, 
                loading: false, 
                deposits: [] 
            })
        }
    },

    createDeposit: async (data) => {
        set({ loading: true, error: null })
        try {
            const response = await createDeposit(data)
            await get().fetchDeposits()
            set({ loading: false })
            return response.data
        } catch (error) {
            set({ error: error.response?.data?.message || error.message, loading: false })
            throw error
        }
    },

    revertDeposit: async (id) => {
        set({ loading: true, error: null })
        try {
            const response = await revertDeposit(id)
            await get().fetchDeposits()
            set({ loading: false })
            return response.data
        } catch (error) {
            set({ error: error.response?.data?.message || error.message, loading: false })
            throw error
        }
    },
}))

export default useDepositStore
