import { afterEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_TOKEN_KEY } from '../lib/tokenStorage.js'
import { apiClient } from '../lib/api.js'
import { exchangeSession } from './authService.js'

vi.mock('../lib/firebase.js', () => ({
  firebaseAuth: {},
  googleProvider: {},
}))

vi.mock('../lib/api.js', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('auth service session exchange', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('exchanges a Firebase token, stores the server access token, and returns the user', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        data: {
          accessToken: 'server-access-token',
          user: {
            email: 'asha@example.com',
            role: 'supporter',
            credits: 50,
          },
        },
      },
    })

    const user = await exchangeSession({
      firebaseUser: {
        getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
      },
      intendedRole: 'supporter',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/auth/session', {
      firebaseIdToken: 'firebase-id-token',
      intendedRole: 'supporter',
    })
    expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('server-access-token')
    expect(user).toMatchObject({ email: 'asha@example.com', role: 'supporter' })
  })
})
