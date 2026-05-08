import api from './api'

export const getAccounts = () => api.get('/accounts/my-accounts')
export const getAccountById = (id) => api.get(`/accounts/${id}/balance`)
export const createAccount = (data) => api.post('/internal/accounts', data, {
    headers: {
        'x-internal-api-key': import.meta.env.VITE_INTERNAL_API_KEY
    }
})
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data)
export const deleteAccount = (id) => api.delete(`/accounts/${id}`)