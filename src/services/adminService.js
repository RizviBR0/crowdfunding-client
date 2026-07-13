import { apiClient } from '../lib/api.js'

export const getAdminUsers = async ({ page = 1, limit = 10, search = '', role = 'all' } = {}) => {
  const response = await apiClient.get('/admin/users', { params: { page, limit, search, role } })
  return { users: response.data.data.users, meta: response.data.meta }
}

export const updateAdminUserRole = async ({ userId, role }) => {
  const response = await apiClient.patch(`/admin/users/${userId}/role`, { role })
  return response.data.data.user
}

export const removeAdminUser = async (userId) => {
  const response = await apiClient.delete(`/admin/users/${userId}`)
  return response.data.data
}

export const getAdminWithdrawals = async ({ page = 1, limit = 10, status = 'pending' } = {}) => {
  const response = await apiClient.get('/admin/withdrawals', { params: { page, limit, status } })
  return { withdrawals: response.data.data.withdrawals, meta: response.data.meta }
}

export const approveAdminWithdrawal = async ({ withdrawalId, idempotencyKey }) => {
  const response = await apiClient.patch(`/admin/withdrawals/${withdrawalId}/approve`, {}, { headers: { 'Idempotency-Key': idempotencyKey } })
  return response.data.data.withdrawal
}

export const rejectAdminWithdrawal = async ({ withdrawalId, idempotencyKey }) => {
  const response = await apiClient.patch(`/admin/withdrawals/${withdrawalId}/reject`, {}, { headers: { 'Idempotency-Key': idempotencyKey } })
  return response.data.data.withdrawal
}

export const getAdminReports = async ({ page = 1, limit = 10, status = 'open' } = {}) => {
  const response = await apiClient.get('/admin/reports', { params: { page, limit, status } })
  return { reports: response.data.data.reports, meta: response.data.meta }
}

export const resolveAdminReport = async ({ reportId, action, reason }) => {
  const response = await apiClient.patch(`/admin/reports/${reportId}`, { action, ...(reason ? { reason } : {}) })
  return response.data.data.report
}

export const getRoleAnalytics = async (role) => {
  const response = await apiClient.get(`/analytics/${role}`)
  return response.data.data.stats
}
