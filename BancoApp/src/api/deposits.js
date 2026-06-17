import api from './api';

export const requestDeposit = async (data) => {
  const response = await api.post('/deposit-requests', data);
  return response.data;
};

export const getMyDepositRequests = async () => {
  console.log('Llamando a deposit-requests/my...');
  const response = await api.get('/deposit-requests/my');
  console.log('Respuesta:', JSON.stringify(response.data).slice(0, 200));
  return response.data;
};

export const getDepositById = async (id) => {
  const response = await api.get(`/deposit-requests/${id}`);
  return response.data;
};