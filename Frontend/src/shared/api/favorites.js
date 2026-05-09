import api from './api'

export const getFavorites = () => api.get('/favorites')
export const createFavorite = (data) => api.post('/favorites', data)
export const deleteFavorite = (id) => api.delete(`/favorites/${id}`)