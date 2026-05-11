'use strict';

const buildUrl = (baseUrl, path) => {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBaseUrl}${cleanPath}`;
};

export const internalRequest = async (baseUrl, path, options = {}) => {
  if (!baseUrl) {
    throw new Error('Base URL interna no configurada');
  }

  if (!process.env.INTERNAL_API_KEY) {
    throw new Error('INTERNAL_API_KEY no configurada');
  }

  const url = buildUrl(baseUrl, path);

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-api-key': process.env.INTERNAL_API_KEY,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      payload.message || `Error consumiendo servicio interno: ${url}`
    );

    error.status = response.status;
    error.payload = payload;

    throw error;
  }

  return payload;
};