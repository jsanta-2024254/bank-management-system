import api from './api'

export const getUsers = () => api.get('/admin/users')
export const getUserById = (id) => api.get(`/admin/users/${id}`)
export const createUser = (data) => api.post('/admin/users', data)
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)
export const updateUserRole = (userId, roleName) => api.put(`/users/${userId}/role`, { roleName })