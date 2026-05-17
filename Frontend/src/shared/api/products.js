import api from './api'

export const getProducts = () => api.get('/products')
export const getProductById = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

export const quoteProduct = (id, data) => api.post(`/products/${id}/quote`, data)
export const acquireProduct = (id, data) => api.post(`/products/${id}/acquire`, data)
export const getMyProductAcquisitions = () => api.get('/products/acquisitions/my')
export const payCreditInstallment = (acquisitionId, paymentId, data) =>
    api.post(`/products/acquisitions/${acquisitionId}/payments/${paymentId}/pay`, data)