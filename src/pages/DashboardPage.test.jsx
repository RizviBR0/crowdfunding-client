import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'
import { ACCESS_TOKEN_KEY } from '../lib/tokenStorage.js'
import { restoreSession } from '../services/authService.js'
import {
  decideCreatorContribution,
  getCreatorContribution,
  getCreatorPendingContributions,
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
    decideCreatorContribution: vi.fn(),
    getCreatorContribution: vi.fn(),
    getCreatorPendingContributions: vi.fn(),
    getSupporterContributionStats: vi.fn(),
    listSupporterApprovedContributions: vi.fn(),
  }
})

const creatorUser = {
  displayName: 'Mina Maker',
  email: 'mina@example.com',
  role: 'creator',
  credits: 20,
}

const pendingContribution = {
  id: 'contribution_1',
  campaignId: 'campaign_1',
  campaignTitle: 'Community Robotics Lab',
  supporterName: 'Sam Supporter',
  supporterEmail: 'supporter@example.com',
  amount: 75,
  message: 'Please build the sensor kit too.',
  status: 'pending',
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

describe('creator dashboard contribution review', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('lists pending contributions, opens detail, and approves with an idempotency key', async () => {
    const user = userEvent.setup()
    getCreatorPendingContributions.mockResolvedValue({
      contributions: [pendingContribution],
      meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    })
    getCreatorContribution.mockResolvedValue(pendingContribution)
    decideCreatorContribution.mockResolvedValue({ ...pendingContribution, status: 'approved' })

    renderAt('/dashboard/creator')

    expect(await screen.findByRole('heading', { name: /pending supporter contributions/i })).toBeInTheDocument()
    expect(await screen.findByText(/sam supporter/i)).toBeInTheDocument()
    expect(screen.getByText(/community robotics lab/i)).toBeInTheDocument()
    expect(screen.getByText(/75 credits/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /view contribution from sam supporter/i }))
    const dialog = await screen.findByRole('dialog', { name: /view contribution/i })
    expect(within(dialog).getByText(/please build the sensor kit too/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /close dialog/i }))

    await user.click(screen.getByRole('button', { name: /approve contribution from sam supporter/i }))

    await waitFor(() => {
      expect(decideCreatorContribution).toHaveBeenCalledWith({
        contributionId: 'contribution_1',
        decision: 'approved',
        idempotencyKey: expect.stringMatching(/.+/),
      })
    })
    expect(await screen.findByText(/contribution approved/i)).toBeInTheDocument()
  })

  it('shows an empty state when there are no pending contributions', async () => {
    getCreatorPendingContributions.mockResolvedValue({
      contributions: [],
      meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
    })

    renderAt('/dashboard/creator')

    expect(await screen.findByText(/no pending contributions/i)).toBeInTheDocument()
  })
})
