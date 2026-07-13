import { apiClient } from '../lib/api.js'

export const createCampaignReport = async ({ campaignId, reason }) => {
  const response = await apiClient.post(`/campaigns/${campaignId}/reports`, { reason })
  return response.data.data.report
}
