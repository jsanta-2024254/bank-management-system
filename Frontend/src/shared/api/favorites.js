import api from './api'

export const getFavorites = () => api.get('/favorites')

export const createFavorite = (data) => api.post('/favorites', data)

export const updateFavorite = (id, data) => api.put(`/favorites/${id}`, data)

export const deleteFavorite = (id) => api.delete(`/favorites/${id}`)

export const transferToFavorite = (id, data) => api.post(`/favorites/${id}/transfer`, data)