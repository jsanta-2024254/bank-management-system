import api from './api';

export const getTransactionsByAccount = async (accountId) => {
  const response = await api.get(`/transactions/account/${accountId}`);
  return response.data;
};

export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const transfer = async ({ fromAccountId, toAccountNumber, toAccountType, amount, description }) => {
  const response = await api.post('/transactions/transfer', {
    fromAccountId,
    toAccountNumber,
    toAccountType,
    amount,
    description,
  });
  return response.data;
};