'use strict';

import { internalRequest } from './internal-http.client.js';

const ACCOUNTS_SERVICE_URL =
  process.env.ACCOUNTS_SERVICE_URL || 'http://localhost:3003';

export const createAccountForUser = async ({
  userId,
  tipoCuenta = 'monetaria',
  saldo = 0,
}) => {
  const response = await internalRequest(
    ACCOUNTS_SERVICE_URL,
    '/api/v1/internal/accounts',
    {
      method: 'POST',
      body: {
        userId,
        tipoCuenta,
        saldo,
      },
    }
  );

  return response.data;
};

export const getAccountByUser = async (userId, { estado = true } = {}) => {
  try {
    const response = await internalRequest(
      ACCOUNTS_SERVICE_URL,
      `/api/v1/internal/accounts/by-user/${userId}?estado=${estado}`,
      {
        method: 'GET',
      }
    );

    return response.data;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
};

export const deactivateAccountsByUser = async (userId) => {
  const response = await internalRequest(
    ACCOUNTS_SERVICE_URL,
    `/api/v1/internal/accounts/by-user/${userId}/deactivate`,
    {
      method: 'PATCH',
    }
  );

  return response.data;
};