import api from './api';

export const convertCurrency = async ({ from = 'GTQ', to, amount, accountId }) => {
  const params = { to };
  if (from) params.from = from;
  if (amount) params.amount = amount;
  if (accountId) params.accountId = accountId;

  const response = await api.get('/currency/convert', { params });
  return response.data;
};