import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'
import { ACCESS_TOKEN_KEY } from '../lib/tokenStorage.js'
import { restoreSession } from '../services/authService.js'
import {
  decideAdminCampaign,
  deleteAdminCampaign,
  getAdminCampaigns,
  suspendAdminCampaign,
} from '../services/campaignService.js'

vi.mock('../services/authService.js', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  registerWithEmail: vi.fn(),
  restoreSession: vi.fn(),
}))

vi.mock('../services/campaignService.js', async () => {
  const actual = await vi.importActual('../services/campaignService.js')

  return {
    ...actual,
    decideAdminCampaign: vi.fn(),
    deleteAdminCampaign: vi.fn(),
    getAdminCampaigns: vi.fn(),
    suspendAdminCampaign: vi.fn(),
  }
})

const adminUser = {
  displayName: 'Ada Admin',
  email: 'admin@example.com',
  role: 'admin',
  credits: 0,
}

const pendingCampaign = {
  id: 'campaign_1',
  title: 'Community Robotics Lab',
  story: 'A practical robotics lab for local students.',
  category: 'Education',
  creatorName: 'Chris Creator',
  creatorEmail: 'creator@example.com',
  fundingGoal: 18000,
  amountRaised: 450,
  deadline: '2027-08-20T00:00:00.000Z',
  status: 'pending',
}

const approvedCampaign = {
  id: 'campaign_2',
  title: 'Green Tiny Homes',
  story: 'Sustainable housing for families.',
  category: 'Environment',
  creatorName: 'Mina Maker',
  creatorEmail: 'mina@example.com',
  fundingGoal: 30000,
  amountRaised: 9000,
  deadline: '2027-10-01T00:00:00.000Z',
  status: 'approved',
}

const renderAt = (path) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, 'stored-token')
  restoreSession.mockResolvedValue(adminUser)
  window.history.pushState({}, '', path)

  render(
    <AppProviders>
      <App />
    </AppProviders>,
  )
}

describe('admin campaign dashboard page', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('loads pending campaigns and approves a campaign with confirmation', async () => {
    const user = userEvent.setup()
    getAdminCampaigns.mockResolvedValue({
      campaigns: [pendingCampaign],
      meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    })
    decideAdminCampaign.mockResolvedValue({ ...pendingCampaign, status: 'approved' })

    renderAt('/dashboard/admin/campaigns')

    expect(await screen.findByRole('heading', { name: /review campaigns with a steady hand/i })).toBeInTheDocument()
    expect(await screen.findByText(/community robotics lab/i)).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /approve community robotics lab/i }))
    const dialog = screen.getByRole('dialog', { name: /approve campaign/i })
    await user.type(within(dialog).getByLabelText(/decision note/i), 'Ready for discovery')
    await user.click(within(dialog).getByRole('button', { name: /approve campaign/i }))

    await waitFor(() => {
      expect(decideAdminCampaign).toHaveBeenCalledWith({
        campaignId: 'campaign_1',
        decision: 'approved',
        reason: 'Ready for discovery',
      })
    })
    expect(await screen.findByText(/campaign approved/i)).toBeInTheDocument()
  })

  it('searches all campaigns and supports suspend and delete flows', async () => {
    const user = userEvent.setup()
    getAdminCampaigns.mockResolvedValue({
      campaigns: [approvedCampaign],
      meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    })
    suspendAdminCampaign.mockResolvedValue({ ...approvedCampaign, status: 'suspended' })
    deleteAdminCampaign.mockResolvedValue({
      refund: { refundedContributions: 2, refundedCredits: 125 },
    })

    renderAt('/dashboard/admin/campaigns')

    await user.click(await screen.findByRole('tab', { name: /all/i }))
    await user.type(screen.getByLabelText(/search campaigns/i), 'tiny')
    await user.click(screen.getByRole('button', { name: /search/i }))

    await waitFor(() => {
      expect(getAdminCampaigns).toHaveBeenLastCalledWith({
        status: 'all',
        search: 'tiny',
        page: 1,
        limit: 10,
      })
    })

    await user.click(await screen.findByRole('button', { name: /suspend green tiny homes/i }))
    const suspendDialog = screen.getByRole('dialog', { name: /suspend campaign/i })
    await user.type(within(suspendDialog).getByLabelText(/reason/i), 'Report review')
    await user.click(within(suspendDialog).getByRole('button', { name: /suspend campaign/i }))

    await waitFor(() => {
      expect(suspendAdminCampaign).toHaveBeenCalledWith({
        campaignId: 'campaign_2',
        reason: 'Report review',
      })
    })
    await user.click(within(suspendDialog).getByRole('button', { name: /^close$/i }))

    await user.click(screen.getByRole('button', { name: /delete green tiny homes/i }))
    const deleteDialog = screen.getByRole('dialog', { name: /delete campaign/i })
    await user.type(within(deleteDialog).getByLabelText(/reason/i), 'Confirmed fraud')
    await user.click(within(deleteDialog).getByRole('button', { name: /delete and refund/i }))

    await waitFor(() => {
      expect(deleteAdminCampaign).toHaveBeenCalledWith({
        campaignId: 'campaign_2',
        reason: 'Confirmed fraud',
      })
    })
    expect(await screen.findByText(/refunded 2 contributions worth 125 credits/i)).toBeInTheDocument()
  })

  it('shows an empty state when no campaigns match the current view', async () => {
    getAdminCampaigns.mockResolvedValue({
      campaigns: [],
      meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
    })

    renderAt('/dashboard/admin/campaigns')

    expect(await screen.findByText(/no campaigns match this view/i)).toBeInTheDocument()
  })
})
