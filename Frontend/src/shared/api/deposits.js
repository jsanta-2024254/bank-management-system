import api from './api'

export const getDeposits = (params) => api.get('/deposits', { params })
export const createDeposit = (data) => api.post('/deposits', data)
export const revertDeposit = (id) => api.post(`/deposits/${id}/revert`)

export const createDepositRequest = (data) => api.post('/deposit-requests', data)
export const getMyDepositRequests = () => api.get('/deposit-requests/my')
export const getDepositRequests = (params) =>
    api.get('/deposit-requests', { params })
export const approveDepositRequest = (id) =>
    api.post(`/deposit-requests/${id}/approve`)
export const rejectDepositRequest = (id, data) =>
    api.post(`/deposit-requests/${id}/reject`, data)