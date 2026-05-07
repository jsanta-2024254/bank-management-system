'use strict';

import { internalRequest } from './internal-http.client.js';

const TRANSACTIONS_SERVICE_URL =
  process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3004';

export const getTransactionsByAccount = async (accountId, limit = 5) => {
  if (!accountId) {
    return [];
  }

  const response = await internalRequest(
    TRANSACTIONS_SERVICE_URL,
    `/api/v1/internal/transactions/by-account/${accountId}?limit=${limit}`,
    {
      method: 'GET',
    }
  );

  return response.data || [];
};