import api from './api';

export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

export const addFavorite = async ({ accountNumber, accountType, alias }) => {
  const response = await api.post('/favorites', { accountNumber, accountType, alias });
  return response.data;
};

export const updateFavorite = async (id, { alias }) => {
  const response = await api.put(`/favorites/${id}`, { alias });
  return response.data;
};

export const deleteFavorite = async (id) => {
  const response = await api.delete(`/favorites/${id}`);
  return response.data;
};