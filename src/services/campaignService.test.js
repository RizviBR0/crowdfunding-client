import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../lib/api.js'
import {
  createCampaign,
  decideAdminCampaign,
  deleteAdminCampaign,
  deleteCampaign,
  getPublicCampaign,
  getPublicCampaigns,
  getAdminCampaigns,
  getCreatorCampaigns,
  suspendAdminCampaign,
  updateCampaign,
} from './campaignService.js'

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

  it('loads public campaigns and detail records from the approved discovery endpoints', async () => {
    apiClient.get
      .mockResolvedValueOnce({
        data: {
          data: { campaigns: [{ id: 'campaign_1', title: 'Robotics Lab' }] },
          meta: { page: 2, totalItems: 13 },
        },
      })
      .mockResolvedValueOnce({
        data: { data: { campaign: { id: 'campaign_1', title: 'Robotics Lab', story: 'Full story' } } },
      })

    await expect(
      getPublicCampaigns({
        page: 2,
        limit: 9,
        search: 'robot',
        category: 'Education',
        deadlineFrom: '2027-01-01',
        deadlineTo: '2027-12-31',
        goalMin: '1000',
        goalMax: '20000',
      }),
    ).resolves.toEqual({
      campaigns: [{ id: 'campaign_1', title: 'Robotics Lab' }],
      meta: { page: 2, totalItems: 13 },
    })
    await expect(getPublicCampaign('campaign_1')).resolves.toEqual({
      id: 'campaign_1',
      title: 'Robotics Lab',
      story: 'Full story',
    })

    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/campaigns', {
      params: {
        page: 2,
        limit: 9,
        search: 'robot',
        category: 'Education',
        deadlineFrom: '2027-01-01',
        deadlineTo: '2027-12-31',
        goalMin: '1000',
        goalMax: '20000',
      },
    })
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/campaigns/campaign_1')
  })

  it('loads and mutates admin campaign records', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: { campaigns: [{ id: 'campaign_1', status: 'pending' }] },
        meta: { page: 1, totalItems: 1 },
      },
    })
    apiClient.patch
      .mockResolvedValueOnce({ data: { data: { campaign: { id: 'campaign_1', status: 'approved' } } } })
      .mockResolvedValueOnce({ data: { data: { campaign: { id: 'campaign_1', status: 'suspended' } } } })
    apiClient.delete.mockResolvedValue({
      data: { data: { refund: { refundedContributions: 2, refundedCredits: 125 } } },
    })

    await expect(getAdminCampaigns({ status: 'all', search: 'robot', page: 2, limit: 5 })).resolves.toEqual({
      campaigns: [{ id: 'campaign_1', status: 'pending' }],
      meta: { page: 1, totalItems: 1 },
    })
    await expect(
      decideAdminCampaign({ campaignId: 'campaign_1', decision: 'approved', reason: 'Ready' }),
    ).resolves.toEqual({ id: 'campaign_1', status: 'approved' })
    await expect(suspendAdminCampaign({ campaignId: 'campaign_1', reason: 'Under review' })).resolves.toEqual({
      id: 'campaign_1',
      status: 'suspended',
    })
    await expect(deleteAdminCampaign({ campaignId: 'campaign_1', reason: 'Confirmed issue' })).resolves.toEqual({
      refund: { refundedContributions: 2, refundedCredits: 125 },
    })

    expect(apiClient.get).toHaveBeenCalledWith('/admin/campaigns', {
      params: { status: 'all', search: 'robot', page: 2, limit: 5 },
    })
    expect(apiClient.patch).toHaveBeenNthCalledWith(1, '/admin/campaigns/campaign_1/decision', {
      decision: 'approved',
      reason: 'Ready',
    })
    expect(apiClient.patch).toHaveBeenNthCalledWith(2, '/admin/campaigns/campaign_1/suspend', {
      reason: 'Under review',
    })
    expect(apiClient.delete).toHaveBeenCalledWith('/admin/campaigns/campaign_1', {
      data: { reason: 'Confirmed issue' },
    })
  })
})
