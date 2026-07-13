import { apiClient } from '../lib/api.js'

export const createCheckoutSession = async (packageId) => {
  const response = await apiClient.post('/payments/checkout-session', { packageId })
  return response.data
}

export const getPaymentHistory = async ({ page = 1, limit = 10 } = {}) => {
  const response = await apiClient.get('/payments/history', {
    params: { page, limit },
  })

  return {
    payments: response.data.data.payments,
    meta: response.data.meta,
  }
}
