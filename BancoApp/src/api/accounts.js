import api from './api';

export const getMyAccounts = async () => {
  const response = await api.get('/accounts/my-accounts');
  return response.data;
};

export const getAccountBalance = async (accountId) => {
  const response = await api.get(`/accounts/${accountId}/balance`);
  return response.data;
};