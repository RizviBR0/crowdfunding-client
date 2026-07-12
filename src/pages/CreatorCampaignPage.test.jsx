import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'
import { ACCESS_TOKEN_KEY } from '../lib/tokenStorage.js'
import { restoreSession } from '../services/authService.js'
import {
  createCampaign,
  deleteCampaign,
  getCreatorCampaigns,
  updateCampaign,
} from '../services/campaignService.js'
import { uploadCampaignImage } from '../services/imageUpload.js'

vi.mock('../services/authService.js', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  registerWithEmail: vi.fn(),
  restoreSession: vi.fn(),
}))

vi.mock('../services/campaignService.js', () => ({
  createCampaign: vi.fn(),
  deleteCampaign: vi.fn(),
  getCreatorCampaigns: vi.fn(),
  updateCampaign: vi.fn(),
}))

vi.mock('../services/imageUpload.js', () => ({
  uploadCampaignImage: vi.fn(),
}))

const creatorUser = {
  displayName: 'Mina Maker',
  email: 'mina@example.com',
  role: 'creator',
  credits: 20,
}

const renderAt = (path) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, 'stored-token')
  restoreSession.mockResolvedValue(creatorUser)
  window.history.pushState({}, '', path)

  render(
    <AppProviders>
      <App />
    </AppProviders>,
  )
}

describe('creator campaign dashboard pages', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('submits a validated campaign with an uploaded imgBB cover', async () => {
    const user = userEvent.setup()
    uploadCampaignImage.mockResolvedValue('https://example.com/uploaded-cover.jpg')
    createCampaign.mockResolvedValue({ id: 'campaign_1', title: 'Build a creative STEM lab' })

    renderAt('/dashboard/creator/campaigns/new')

    const form = await screen.findByRole('form', { name: /add campaign form/i })

    await user.type(within(form).getByLabelText(/campaign title/i), 'Build a creative STEM lab')
    await user.selectOptions(within(form).getByLabelText(/category/i), 'Education')
    await user.type(within(form).getByLabelText(/funding goal/i), '18000')
    await user.type(within(form).getByLabelText(/minimum contribution/i), '25')
    await user.type(within(form).getByLabelText(/deadline/i), '2027-08-20')
    await user.type(
      within(form).getByLabelText(/campaign story/i),
      'We are creating a hands-on robotics lab for young learners in our community.',
    )
    await user.type(within(form).getByLabelText(/reward info/i), 'Supporters receive monthly build updates.')
    await user.upload(
      within(form).getByLabelText(/upload cover image/i),
      new File(['cover'], 'cover.png', { type: 'image/png' }),
    )
    await user.click(within(form).getByRole('button', { name: /submit for approval/i }))

    await waitFor(() => {
      expect(createCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Build a creative STEM lab',
          category: 'Education',
          fundingGoal: 18000,
          minimumContribution: 25,
          imageUrl: 'https://example.com/uploaded-cover.jpg',
        }),
      )
    })
    expect(uploadCampaignImage).toHaveBeenCalledTimes(1)
    expect(await screen.findByText(/submitted for admin approval/i)).toBeInTheDocument()
  })

  it('validates campaign fields before submitting', async () => {
    const user = userEvent.setup()

    renderAt('/dashboard/creator/campaigns/new')

    const form = await screen.findByRole('form', { name: /add campaign form/i })
    await user.click(within(form).getByRole('button', { name: /submit for approval/i }))

    expect(await screen.findByText(/title must be at least 3 characters/i)).toBeInTheDocument()
    expect(createCampaign).not.toHaveBeenCalled()
    expect(uploadCampaignImage).not.toHaveBeenCalled()
  })

  it('lists creator campaigns and supports update and delete actions', async () => {
    const user = userEvent.setup()
    getCreatorCampaigns.mockResolvedValue({
      campaigns: [
        {
          id: 'campaign_1',
          title: 'Community Robotics Lab',
          story: 'Original story long enough for editing.',
          category: 'Education',
          fundingGoal: 18000,
          amountRaised: 450,
          deadline: '2027-08-20T00:00:00.000Z',
          rewardInfo: 'Original reward',
          status: 'approved',
        },
      ],
      meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    })
    updateCampaign.mockResolvedValue({ id: 'campaign_1', title: 'Updated Robotics Lab' })
    deleteCampaign.mockResolvedValue({
      refund: { refundedContributions: 2, refundedCredits: 125 },
    })

    renderAt('/dashboard/creator/campaigns')

    expect(await screen.findByRole('heading', { name: /manage your campaign pipeline/i })).toBeInTheDocument()
    expect(await screen.findByText(/community robotics lab/i)).toBeInTheDocument()
    expect(screen.getByText(/approved/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /update community robotics lab/i }))
    const updateForm = screen.getByRole('form', { name: /update campaign form/i })
    await user.clear(within(updateForm).getByLabelText(/campaign title/i))
    await user.type(within(updateForm).getByLabelText(/campaign title/i), 'Updated Robotics Lab')
    await user.clear(within(updateForm).getByLabelText(/campaign story/i))
    await user.type(
      within(updateForm).getByLabelText(/campaign story/i),
      'Updated campaign story that keeps supporters aligned with project progress.',
    )
    await user.clear(within(updateForm).getByLabelText(/reward info/i))
    await user.type(within(updateForm).getByLabelText(/reward info/i), 'Updated reward details.')
    await user.click(within(updateForm).getByRole('button', { name: /save updates/i }))

    await waitFor(() => {
      expect(updateCampaign).toHaveBeenCalledWith({
        campaignId: 'campaign_1',
        payload: {
          title: 'Updated Robotics Lab',
          story: 'Updated campaign story that keeps supporters aligned with project progress.',
          rewardInfo: 'Updated reward details.',
        },
      })
    })

    await user.click(screen.getByRole('button', { name: /delete community robotics lab/i }))
    await user.click(screen.getByRole('button', { name: /delete and refund/i }))

    await waitFor(() => {
      expect(deleteCampaign).toHaveBeenCalledWith('campaign_1')
    })
    expect(await screen.findByText(/refunded 2 contributions worth 125 credits/i)).toBeInTheDocument()
  })
})
