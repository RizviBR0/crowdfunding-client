import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../lib/api.js'
import { createCampaign, deleteCampaign, getCreatorCampaigns, updateCampaign } from './campaignService.js'

vi.mock('../lib/api.js', () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}))

describe('campaign service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates a campaign through the protected campaign endpoint', async () => {
    apiClient.post.mockResolvedValue({
      data: { data: { campaign: { id: 'campaign_1', title: 'STEM Lab' } } },
    })

    const campaign = await createCampaign({ title: 'STEM Lab' })

    expect(apiClient.post).toHaveBeenCalledWith('/campaigns', { title: 'STEM Lab' })
    expect(campaign).toEqual({ id: 'campaign_1', title: 'STEM Lab' })
  })

  it('loads creator campaigns with pagination params', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: { campaigns: [{ id: 'campaign_1' }] },
        meta: { page: 2, totalItems: 11 },
      },
    })

    const result = await getCreatorCampaigns({ page: 2, limit: 5 })

    expect(apiClient.get).toHaveBeenCalledWith('/creator/campaigns', {
      params: { page: 2, limit: 5 },
    })
    expect(result).toEqual({
      campaigns: [{ id: 'campaign_1' }],
      meta: { page: 2, totalItems: 11 },
    })
  })

  it('updates and deletes owner campaigns', async () => {
    apiClient.patch.mockResolvedValue({
      data: { data: { campaign: { id: 'campaign_1', title: 'Updated' } } },
    })
    apiClient.delete.mockResolvedValue({
      data: { data: { refund: { refundedContributions: 1, refundedCredits: 50 } } },
    })

    await expect(updateCampaign({ campaignId: 'campaign_1', payload: { title: 'Updated' } })).resolves.toEqual({
      id: 'campaign_1',
      title: 'Updated',
    })
    await expect(deleteCampaign('campaign_1')).resolves.toEqual({
      refund: { refundedContributions: 1, refundedCredits: 50 },
    })
    expect(apiClient.patch).toHaveBeenCalledWith('/campaigns/campaign_1', { title: 'Updated' })
    expect(apiClient.delete).toHaveBeenCalledWith('/campaigns/campaign_1')
  })
})
