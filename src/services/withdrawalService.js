import { apiClient } from '../lib/api.js'

export const getCreatorEarnings = async () => {
  const response = await apiClient.get('/creator/earnings')

  return response.data.data
}

export const createWithdrawal = async ({ credits, paymentSystem, accountNumber, idempotencyKey }) => {
  const response = await apiClient.post(
    '/withdrawals',
    { credits, paymentSystem, accountNumber },
    {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    },
  )

  return response.data.data
}

export const getCreatorWithdrawals = async ({ page = 1, limit = 10, status } = {}) => {
  const params = { page, limit }

  if (status) {
    params.status = status
  }

  const response = await apiClient.get('/creator/withdrawals', { params })

  return {
    withdrawals: response.data.data,
    meta: response.data.meta,
  }
}
