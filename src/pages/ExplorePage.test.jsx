import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'
import { ACCESS_TOKEN_KEY } from '../lib/tokenStorage.js'
import { restoreSession } from '../services/authService.js'
import { getPublicCampaign, getPublicCampaigns } from '../services/campaignService.js'

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
    getPublicCampaign: vi.fn(),
    getPublicCampaigns: vi.fn(),
  }
})

const supporterUser = {
  displayName: 'Sam Supporter',
  email: 'sam@example.com',
  role: 'supporter',
  credits: 75,
}

const campaigns = [
  {
    id: 'campaign_1',
    title: 'Community Robotics Lab',
    category: 'Education',
    coverImageUrl: 'https://example.com/robotics.jpg',
    creatorName: 'Chris Creator',
    fundingGoal: 18000,
    amountRaised: 12450,
    deadline: '2027-08-20T00:00:00.000Z',
  },
  {
    id: 'campaign_2',
    title: 'Green Tiny Homes',
    category: 'Environment',
    coverImageUrl: 'https://example.com/homes.jpg',
    creatorName: 'Mina Maker',
    fundingGoal: 30000,
    amountRaised: 9000,
    deadline: '2027-10-01T00:00:00.000Z',
  },
]

const detailCampaign = {
  ...campaigns[0],
  story: 'A practical robotics lab where young learners build, code, test, and share inventions with mentors.',
  minimumContribution: 25,
  rewardInfo: 'Supporters receive build updates and a digital thank-you wall.',
  status: 'approved',
}

const renderAt = (path, user = null) => {
  if (user) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, 'stored-token')
    restoreSession.mockResolvedValue(user)
  }

  window.history.pushState({}, '', path)

  render(
    <AppProviders>
      <App />
    </AppProviders>,
  )
}

describe('Explore campaign pages', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('renders approved campaign cards and navigates to details', async () => {
    getPublicCampaigns.mockResolvedValue({
      campaigns,
      meta: { page: 1, limit: 9, totalItems: 2, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderAt('/explore')

    expect(await screen.findByRole('heading', { name: /explore campaigns ready for support/i })).toBeInTheDocument()
    expect(await screen.findByText(/community robotics lab/i)).toBeInTheDocument()
    expect(await screen.findByText(/green tiny homes/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /view details/i })[0]).toHaveAttribute('href', '/campaigns/campaign_1')
  })

  it('submits URL-backed filters to the public discovery service', async () => {
    const user = userEvent.setup()
    getPublicCampaigns.mockResolvedValue({
      campaigns: [],
      meta: { page: 1, limit: 9, totalItems: 0, totalPages: 0, hasNext: false, hasPrev: false },
    })

    renderAt('/explore')

    await screen.findByRole('heading', { name: /explore campaigns ready for support/i })
    await user.type(screen.getByLabelText(/search campaigns/i), 'robot')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Education')
    await user.type(screen.getByLabelText(/from deadline/i), '2027-01-01')
    await user.type(screen.getByLabelText(/goal from/i), '1000')
    await user.click(screen.getByRole('button', { name: /search/i }))

    await waitFor(() => {
      expect(getPublicCampaigns).toHaveBeenLastCalledWith({
        page: 1,
        limit: 9,
        search: 'robot',
        category: 'Education',
        deadlineFrom: '2027-01-01',
        deadlineTo: '',
        goalMin: '1000',
        goalMax: '',
      })
    })
  })

  it('shows campaign details with supporter-only contribution controls', async () => {
    getPublicCampaign.mockResolvedValue(detailCampaign)

    renderAt('/campaigns/campaign_1', supporterUser)

    expect(await screen.findByRole('heading', { name: /community robotics lab/i })).toBeInTheDocument()
    expect(screen.getByText(/young learners build/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/credits to contribute/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /contribution opens next/i })).toBeDisabled()
  })

  it('uses the same campaign discovery inside the supporter dashboard', async () => {
    getPublicCampaigns.mockResolvedValue({
      campaigns: [campaigns[0]],
      meta: { page: 1, limit: 9, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderAt('/dashboard/supporter/explore', supporterUser)

    expect(await screen.findByText(/fundbloom dashboard/i)).toBeInTheDocument()
    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { name: /explore campaigns ready for support/i })).toBeInTheDocument()
    expect(await within(main).findByText(/community robotics lab/i)).toBeInTheDocument()
  })
})
