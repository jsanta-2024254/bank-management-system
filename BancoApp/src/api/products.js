import api from './api';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const quoteProduct = async (id, data) => {
  const response = await api.post(`/products/${id}/quote`, data);
  return response.data;
};

export const requestCreditFromOpportunity = async (id, { cuentaId, montoSolicitado, plazoMeses, comentarioCliente }) => {
  const response = await api.post(`/products/${id}/request-credit`, {
    cuentaId, montoSolicitado, plazoMeses, comentarioCliente,
  });
  return response.data;
};

export const getMyCreditRequests = async () => {
  const response = await api.get('/products/credits/my');
  return response.data;
};