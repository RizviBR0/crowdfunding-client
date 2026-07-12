import { apiClient } from '../lib/api.js'

export const getHomepageData = async () => {
  const response = await apiClient.get('/campaigns/top-funded')

  return response.data.data
}
