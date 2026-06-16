import api from './api';

export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

export const addFavorite = async ({ numeroCuenta, tipoCuenta, alias }) => {
  const response = await api.post('/favorites', { numeroCuenta, tipoCuenta, alias });
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

export const transferToFavorite = async (id, { monto, tipoCuentaOrigen, descripcion }) => {
  const response = await api.post(`/favorites/${id}/transfer`, {
    monto,
    tipoCuentaOrigen,
    descripcion,
  });
  return response.data;
};