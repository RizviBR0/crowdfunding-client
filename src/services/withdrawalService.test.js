import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../lib/api.js'
import { createWithdrawal, getCreatorEarnings, getCreatorWithdrawals } from './withdrawalService.js'

vi.mock('../lib/api.js', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('withdrawal service', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads creator earnings with the server-owned conversion', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: {
          lifetimeRaised: 600,
          reservedForWithdrawal: 100,
          withdrawn: 50,
          withdrawable: 450,
          withdrawableAmountCents: 2250,
        },
      },
    })

    await expect(getCreatorEarnings()).resolves.toEqual({
      lifetimeRaised: 600,
      reservedForWithdrawal: 100,
      withdrawn: 50,
      withdrawable: 450,
      withdrawableAmountCents: 2250,
    })
    expect(apiClient.get).toHaveBeenCalledWith('/creator/earnings')
  })

  it('creates an idempotent withdrawal request without trusting display dollars', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        data: {
          id: 'withdrawal_1',
          withdrawalCredit: 300,
          withdrawalAmountCents: 1500,
          status: 'pending',
        },
      },
    })

    await expect(
      createWithdrawal({
        credits: 300,
        paymentSystem: 'Stripe',
        accountNumber: 'US1234567890',
        idempotencyKey: 'withdrawal-key-1',
      }),
    ).resolves.toEqual({
      id: 'withdrawal_1',
      withdrawalCredit: 300,
      withdrawalAmountCents: 1500,
      status: 'pending',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/withdrawals',
      { credits: 300, paymentSystem: 'Stripe', accountNumber: 'US1234567890' },
      { headers: { 'Idempotency-Key': 'withdrawal-key-1' } },
    )
  })

  it('loads owner-scoped withdrawal history with optional status filtering', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [{ id: 'withdrawal_1', status: 'approved' }],
        meta: { page: 2, limit: 5, totalItems: 6, totalPages: 2 },
      },
    })

    await expect(getCreatorWithdrawals({ page: 2, limit: 5, status: 'approved' })).resolves.toEqual({
      withdrawals: [{ id: 'withdrawal_1', status: 'approved' }],
      meta: { page: 2, limit: 5, totalItems: 6, totalPages: 2 },
    })
    expect(apiClient.get).toHaveBeenCalledWith('/creator/withdrawals', {
      params: { page: 2, limit: 5, status: 'approved' },
    })
  })
})
