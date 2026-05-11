import api from './api'

export const getTransactionsByAccount = (accountId) => api.get(`/transactions/account/${accountId}`)
export const createTransfer = (data) => api.post('/transactions/transfer', data)

// Alias for generic usage as requested
export const getTransactions = (accountId) => getTransactionsByAccount(accountId)
export const createTransaction = (data) => createTransfer(data)
