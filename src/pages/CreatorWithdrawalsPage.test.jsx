import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'
import { ACCESS_TOKEN_KEY } from '../lib/tokenStorage.js'
import { restoreSession } from '../services/authService.js'
import { createWithdrawal, getCreatorEarnings, getCreatorWithdrawals } from '../services/withdrawalService.js'

vi.mock('../services/authService.js', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  registerWithEmail: vi.fn(),
  restoreSession: vi.fn(),
}))

vi.mock('../services/withdrawalService.js', () => ({
  createWithdrawal: vi.fn(),
  getCreatorEarnings: vi.fn(),
  getCreatorWithdrawals: vi.fn(),
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

const setEarnings = (overrides = {}) => {
  getCreatorEarnings.mockResolvedValue({
    lifetimeRaised: 600,
    reservedForWithdrawal: 0,
    withdrawn: 0,
    withdrawable: 600,
    withdrawableAmountCents: 3000,
    ...overrides,
  })
}

describe('creator withdrawals page', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('shows earnings conversion, submits a validated request, and refreshes history', async () => {
    const user = userEvent.setup()
    setEarnings()
    getCreatorWithdrawals.mockResolvedValue({
      withdrawals: [
        {
          id: 'withdrawal_1',
          withdrawalCredit: 300,
          withdrawalAmountCents: 1500,
          paymentSystem: 'Stripe',
          withdrawDate: '2026-07-12T00:00:00.000Z',
          status: 'pending',
        },
      ],
      meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    })
    createWithdrawal.mockResolvedValue({ id: 'withdrawal_2', status: 'pending' })

    renderAt('/dashboard/creator/withdrawals')

    expect(await screen.findByRole('heading', { name: /turn community momentum/i })).toBeInTheDocument()
    expect((await screen.findAllByText(/600 credits/i)).length).toBe(2)
    expect(await screen.findByText('$30.00')).toBeInTheDocument()
    expect(screen.getByText(/20 → \$1/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /every payout request/i })).toBeInTheDocument()
    expect(screen.getByText(/pending/i)).toBeInTheDocument()

    const form = screen.getByRole('form', { name: /withdrawal request form/i })
    await user.type(within(form).getByLabelText(/credits to withdraw/i), '300')
    await user.type(within(form).getByLabelText(/account number/i), 'US1234567890')
    expect(within(form).getByDisplayValue('$15.00')).toBeInTheDocument()
    await user.click(within(form).getByRole('button', { name: /request withdrawal/i }))

    await waitFor(() => {
      expect(createWithdrawal).toHaveBeenCalledWith({
        credits: 300,
        paymentSystem: 'Stripe',
        accountNumber: 'US1234567890',
        idempotencyKey: expect.stringMatching(/.+/),
      })
    })
    expect(await screen.findByText(/submitted for admin review/i)).toBeInTheDocument()
  })

  it('hides the request action and shows insufficient credit below the minimum balance', async () => {
    setEarnings({ withdrawable: 150, withdrawableAmountCents: 750 })
    getCreatorWithdrawals.mockResolvedValue({
      withdrawals: [],
      meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
    })

    renderAt('/dashboard/creator/withdrawals')

    const form = await screen.findByRole('form', { name: /withdrawal request form/i })
    expect(within(form).getByText(/insufficient credit/i)).toBeInTheDocument()
    expect(within(form).queryByRole('button', { name: /request withdrawal/i })).not.toBeInTheDocument()
  })

  it('blocks requests above the available balance with field validation', async () => {
    const user = userEvent.setup()
    setEarnings({ withdrawable: 250, withdrawableAmountCents: 1250 })
    getCreatorWithdrawals.mockResolvedValue({ withdrawals: [], meta: { page: 1, totalItems: 0, totalPages: 0 } })

    renderAt('/dashboard/creator/withdrawals')

    const form = await screen.findByRole('form', { name: /withdrawal request form/i })
    await user.type(within(form).getByLabelText(/credits to withdraw/i), '300')
    expect(within(form).getByText(/insufficient credit/i)).toBeInTheDocument()
    expect(within(form).queryByRole('button', { name: /request withdrawal/i })).not.toBeInTheDocument()
    expect(createWithdrawal).not.toHaveBeenCalled()
  })
})
