import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../lib/api.js'
import { getHomepageData } from './homeService.js'

vi.mock('../lib/api.js', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('home service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads top funded homepage data from the public campaign endpoint', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: {
          campaigns: [{ id: 'campaign_1', title: 'Green Tiny Homes' }],
          impact: { approvedCampaigns: 1, totalRaisedCredits: 1200 },
        },
      },
    })

    const data = await getHomepageData()

    expect(apiClient.get).toHaveBeenCalledWith('/campaigns/top-funded')
    expect(data.campaigns[0]).toMatchObject({ title: 'Green Tiny Homes' })
  })
})
