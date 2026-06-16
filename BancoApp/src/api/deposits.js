import api from './api';

export const requestDeposit = async (data) => {
  const response = await api.post('/deposit-requests', data);
  return response.data;
};

export const getMyDepositRequests = async () => {
  const response = await api.get('/deposit-requests/my');
  return response.data;
};

export const getDepositById = async (id) => {
  const response = await api.get(`/deposit-requests/${id}`);
  return response.data;
};