import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import {
    getDeposits,
    createDeposit as createDepositRequest,
    revertDeposit as revertDepositRequest,
    createDepositRequest as createDepositRequestApi,
    getMyDepositRequests,
    getDepositRequests as getDepositRequestsApi,
    approveDepositRequest as approveDepositRequestApi,
    rejectDepositRequest as rejectDepositRequestApi,
} from '../../../shared/api/deposits'

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    )
}

const getList = (response) => {
    const data = response?.data?.data || response?.data?.deposits || response?.data || []
    return Array.isArray(data) ? data : []
}

const getPagination = (response, page, limit) => {
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
    depositRequests: [],
    myDepositRequests: [],
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
                deposits: getList(response),
                pagination: getPagination(response, page, limit),
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

    fetchMyDepositRequests: async () => {
        set({ loading: true, error: null })

        try {
            const response = await getMyDepositRequests()

            set({
                myDepositRequests: getList(response),
                loading: false,
                error: null,
            })
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Error al cargar tus solicitudes de depósito'
            )

            set({
                error: message,
                loading: false,
                myDepositRequests: [],
            })

            toast.error(message)
        }
    },

    fetchDepositRequests: async (params = {}) => {
        set({ loading: true, error: null })

        try {
            const response = await getDepositRequestsApi(params)

            set({
                depositRequests: getList(response),
                loading: false,
                error: null,
            })
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Error al cargar las solicitudes de depósito'
            )

            set({
                error: message,
                loading: false,
                depositRequests: [],
            })

            toast.error(message)
        }
    },

    createDepositRequest: async (data) => {
        set({ loading: true, error: null })

        try {
            const response = await createDepositRequestApi(data)
            await get().fetchMyDepositRequests()

            set({
                loading: false,
                error: null,
            })

            return response.data
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Error al enviar la solicitud de depósito'
            )

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    approveDepositRequest: async (id) => {
        set({ loading: true, error: null })

        try {
            const response = await approveDepositRequestApi(id)
            await get().fetchDepositRequests({ estado: 'pendiente' })

            set({
                loading: false,
                error: null,
            })

            return response.data
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Error al aprobar la solicitud'
            )

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },

    rejectDepositRequest: async (id, data) => {
        set({ loading: true, error: null })

        try {
            const response = await rejectDepositRequestApi(id, data)
            await get().fetchDepositRequests({ estado: 'pendiente' })

            set({
                loading: false,
                error: null,
            })

            return response.data
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Error al rechazar la solicitud'
            )

            set({
                error: message,
                loading: false,
            })

            throw error
        }
    },
}))

export default useDepositStore