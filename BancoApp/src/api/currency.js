import api from './api';

export const convertCurrency = async ({ from, to, amount }) => {
  const response = await api.get('/currency/convert', { params: { from, to, amount } });
  return response.data;
};