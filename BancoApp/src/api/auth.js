import api from './api';

export const register = async ({ name, surname, username, email, password, phone }) => {
  const response = await api.post('/auth/register', {
    name,
    surname,
    username,
    email,
    password,
    phone,
  });
  return response.data;
};

export const login = async ({ emailOrUsername, password }) => {
  const response = await api.post('/auth/login', { emailOrUsername, password });
  return response.data;
};

export const sendTwoFactor = async (emailOrUsername) => {
  const response = await api.post('/auth/send-2fa', { emailOrUsername });
  return response.data;
};

export const verifyTwoFactor = async ({ emailOrUsername, code }) => {
  const response = await api.post('/auth/verify-2fa', { emailOrUsername, code });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};