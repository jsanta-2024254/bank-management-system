import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import {
    getDeposits,
    createDeposit as createDepositRequest,
    revertDeposit as revertDepositRequest,
} from '../../../shared/api/deposits'

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    )
}

const getDepositList = (response) => {
    const deposits = response?.data?.data || response?.data?.deposits || response?.data || []
    return Array.isArray(deposits) ? deposits : []
}

const getDepositPagination = (response, page, limit) => {
    const pagination = response?.data?.pagination || {}

    return {
        total: response?.data?.total || pagination.totalRecords || pagination.total || 0,
        page: pagination.currentPage || page,
        totalPages: pagination.totalPages || 1,
        limit: pagination.limit || limit,
    }
}

const useDepositStore = create((set, get) => ({
    deposits: [],
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 10,
    },

    fetchDeposits: async (page = 1, limit = 10) => {
        set({ loading: true, error: null })

        try {
            const response = await getDeposits({ page, limit })

            set({
                deposits: getDepositList(response),
                pagination: getDepositPagination(response, page, limit),
                loading: false,
                error: null,
            })
        } catch (error) {
            const message = getErrorMessage(error, 'Error al cargar los depósitos')

            set({
                error: message,
                loading: false,
                deposits: [],
            })

            toast.error(message)
        }
    },

    createDeposit: async (data) => {
        set({ loading: true, error: null })

        try {
            const response = await createDepositRequest(data)
            await get().fetchDeposits()

            set({
                loading: false,
                error: null,
            })

            return response.data
        } catch (error) {
            const message = getErrorMessage(error, 'Error al realizar el depósito')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    revertDeposit: async (id) => {
        set({ loading: true, error: null })

        try {
            const response = await revertDepositRequest(id)
            await get().fetchDeposits()

            set({
                loading: false,
                error: null,
            })

            return response.data
        } catch (error) {
            const message = getErrorMessage(error, 'Error al revertir el depósito')

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },
}))

export default useDepositStore