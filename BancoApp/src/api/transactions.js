import api from './api';

export const getTransactionsByAccount = async (accountId) => {
  const response = await api.get(`/transactions/account/${accountId}`);
  return response.data;
};

export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const transfer = async ({ numeroCuentaDestino, tipoCuentaDestino, tipoCuentaOrigen, monto, descripcion }) => {
  const response = await api.post('/transactions/transfer', {
    numeroCuentaDestino,
    tipoCuentaDestino,
    tipoCuentaOrigen,
    monto,
    descripcion,
  });
  return response.data;
};