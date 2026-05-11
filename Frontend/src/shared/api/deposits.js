import api from './api'

export const getDeposits = (params) => api.get('/deposits', { params })
export const createDeposit = (data) => api.post('/deposits', data)
export const revertDeposit = (id) => api.post(`/deposits/${id}/revert`)
