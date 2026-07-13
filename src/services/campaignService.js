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

export const getPublicCampaigns = async ({
  page = 1,
  limit = 9,
  search = '',
  category = '',
  deadlineFrom = '',
  deadlineTo = '',
  goalMin = '',
  goalMax = '',
} = {}) => {
  const params = { page, limit }

  if (search) params.search = search
  if (category) params.category = category
  if (deadlineFrom) params.deadlineFrom = deadlineFrom
  if (deadlineTo) params.deadlineTo = deadlineTo
  if (goalMin) params.goalMin = goalMin
  if (goalMax) params.goalMax = goalMax

  const response = await apiClient.get('/campaigns', { params })

  return {
    campaigns: response.data.data.campaigns,
    meta: response.data.meta,
  }
}

export const getPublicCampaign = async (campaignId) => {
  const response = await apiClient.get(`/campaigns/${campaignId}`)

  return response.data.data.campaign
}

export const createContribution = async ({ campaignId, amount, message = '', idempotencyKey }) => {
  const response = await apiClient.post(
    `/campaigns/${campaignId}/contributions`,
    {
      amount,
      ...(message ? { message } : {}),
    },
    {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    },
  )

  return response.data.data.contribution
}

export const getCreatorPendingContributions = async ({ page = 1, limit = 10 } = {}) => {
  const response = await apiClient.get('/creator/contributions/pending', {
    params: { page, limit },
  })

  return {
    contributions: response.data.data.contributions,
    meta: response.data.meta,
  }
}

export const getCreatorContribution = async (contributionId) => {
  const response = await apiClient.get(`/creator/contributions/${contributionId}`)

  return response.data.data.contribution
}

export const decideCreatorContribution = async ({ contributionId, decision, idempotencyKey }) => {
  const response = await apiClient.patch(
    `/creator/contributions/${contributionId}/decision`,
    { decision },
    {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    },
  )

  return response.data.data.contribution
}

export const getAdminCampaigns = async ({ status = 'pending', search = '', page = 1, limit = 10 } = {}) => {
  const response = await apiClient.get('/admin/campaigns', {
    params: { status, search, page, limit },
  })

  return {
    campaigns: response.data.data.campaigns,
    meta: response.data.meta,
  }
}

export const decideAdminCampaign = async ({ campaignId, decision, reason }) => {
  const response = await apiClient.patch(`/admin/campaigns/${campaignId}/decision`, {
    decision,
    ...(reason ? { reason } : {}),
  })

  return response.data.data.campaign
}

export const suspendAdminCampaign = async ({ campaignId, reason }) => {
  const response = await apiClient.patch(`/admin/campaigns/${campaignId}/suspend`, { reason })

  return response.data.data.campaign
}

export const deleteAdminCampaign = async ({ campaignId, reason }) => {
  const response = await apiClient.delete(`/admin/campaigns/${campaignId}`, {
    data: reason ? { reason } : {},
  })

  return response.data.data
}

export const getSupporterContributionStats = async () => {
  const response = await apiClient.get('/supporter/contributions/stats')

  return response.data.data.stats
}

export const listSupporterApprovedContributions = async ({ page, limit }) => {
  const response = await apiClient.get('/supporter/contributions/approved', {
    params: { page, limit },
  })

  return {
    contributions: response.data.data.contributions,
    meta: response.data.meta,
  }
}

export const listSupporterOwnedContributions = async ({ status, page, limit }) => {
  const response = await apiClient.get('/supporter/contributions', {
    params: { status, page, limit },
  })

  return {
    contributions: response.data.data.contributions,
    meta: response.data.meta,
  }
}
