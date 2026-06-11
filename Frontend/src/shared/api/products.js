import api from './api'

export const getProducts = () => api.get('/products')

export const getProductById = (id) => api.get(`/products/${id}`)

export const createProduct = (data) => api.post('/products', data)

export const updateProduct = (id, data) => api.put(`/products/${id}`, data)

export const deleteProduct = (id) => api.delete(`/products/${id}`)

export const quoteProduct = (id, data) => api.post(`/products/${id}/quote`, data)

export const acquireProduct = (id, data) => api.post(`/products/${id}/acquire`, data)

export const getMyProductAcquisitions = () => api.get('/products/acquisitions/my')

export const payAcquisitionInstallment = (acquisitionId, paymentId, data) =>
    api.post(`/products/acquisitions/${acquisitionId}/payments/${paymentId}/pay`, data)

export const requestCreditOpportunity = (id, data) =>
    api.post(`/products/${id}/request-credit`, data)

export const requestCustomCredit = (data) => api.post('/products/credits/request', data)

export const getMyCreditRequests = () => api.get('/products/credits/my')

export const getCreditRequests = (params = {}) =>
    api.get('/products/credits/requests', { params })

export const approveCreditRequest = (id, data) =>
    api.post(`/products/credits/requests/${id}/approve`, data)

export const rejectCreditRequest = (id, data) =>
    api.post(`/products/credits/requests/${id}/reject`, data)

export const payCreditInstallment = (creditRequestId, paymentId, data) =>
    api.post(`/products/credits/requests/${creditRequestId}/payments/${paymentId}/pay`, data)

export const cancelSubscription = (acquisitionId, data = {}) =>
    api.post(`/products/subscriptions/${acquisitionId}/cancel`, data)