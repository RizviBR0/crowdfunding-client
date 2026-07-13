import { apiClient } from '../lib/api.js'

export const getNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get('/notifications', { params: { page, limit } })
  return { notifications: response.data.data.notifications, meta: response.data.meta }
}

export const markNotificationRead = async (notificationId) => {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`)
  return response.data.data
}

export const markAllNotificationsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all')
  return response.data.data
}
