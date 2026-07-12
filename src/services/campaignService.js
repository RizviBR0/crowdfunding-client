import { apiClient } from '../lib/api.js'

export const createCampaign = async (payload) => {
  const response = await apiClient.post('/campaigns', payload)

  return response.data.data.campaign
}

export const getCreatorCampaigns = async ({ page = 1, limit = 10 } = {}) => {
  const response = await apiClient.get('/creator/campaigns', {
    params: { page, limit },
  })

  return {
    campaigns: response.data.data.campaigns,
    meta: response.data.meta,
  }
}

export const updateCampaign = async ({ campaignId, payload }) => {
  const response = await apiClient.patch(`/campaigns/${campaignId}`, payload)

  return response.data.data.campaign
}

export const deleteCampaign = async (campaignId) => {
  const response = await apiClient.delete(`/campaigns/${campaignId}`)

  return response.data.data
}
