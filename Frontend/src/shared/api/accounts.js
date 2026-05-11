import api from './api'

export const getAccounts = () => api.get('/accounts/my-accounts')
export const getAccountById = (id) => api.get(`/accounts/${id}/balance`)

export const createAccount = (data) => api.post('/accounts', data)
export const createMyAccount = (data) => api.post('/accounts/my-accounts', data)

export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data)
export const deleteAccount = (id) => api.delete(`/accounts/${id}`)