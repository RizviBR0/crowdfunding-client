import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'
import { ACCESS_TOKEN_KEY } from '../lib/tokenStorage.js'
import { restoreSession } from '../services/authService.js'

vi.mock('../services/authService.js', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  registerWithEmail: vi.fn(),
  restoreSession: vi.fn(),
}))

const renderAt = (path) => {
  window.history.pushState({}, '', path)

  render(
    <AppProviders>
      <App />
    </AppProviders>,
  )
}

describe('authenticated dashboard routing', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('keeps a private dashboard route after reload restoration', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, 'stored-token')
    restoreSession.mockResolvedValue({
      displayName: 'Asha Bloom',
      email: 'asha@example.com',
      role: 'supporter',
      credits: 50,
    })

    renderAt('/dashboard/supporter')

    expect(screen.getByText(/loading your fundbloom session/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /track every idea you back/i })).toBeInTheDocument()
    expect(screen.getByText(/50 credits/i)).toBeInTheDocument()
    expect(restoreSession).toHaveBeenCalledTimes(1)
  })

  it('redirects the dashboard index to the canonical role home', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, 'stored-token')
    restoreSession.mockResolvedValue({
      displayName: 'Mina Maker',
      email: 'mina@example.com',
      role: 'creator',
      credits: 20,
    })

    renderAt('/dashboard')

    expect(await screen.findByRole('heading', { name: /prepare campaigns for real support/i })).toBeInTheDocument()
  })

  it('keeps wrong-role dashboard routes out of reach', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, 'stored-token')
    restoreSession.mockResolvedValue({
      displayName: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      credits: 0,
    })

    renderAt('/dashboard/creator')

    expect(await screen.findByRole('heading', { name: /keep fundbloom moving cleanly/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /prepare campaigns for real support/i })).not.toBeInTheDocument()
  })

  it('redirects unauthenticated private routes to login after restoration settles', async () => {
    renderAt('/dashboard/supporter')

    expect(await screen.findByRole('heading', { name: /login to fundbloom/i })).toBeInTheDocument()
    expect(restoreSession).not.toHaveBeenCalled()
  })

  it('opens the responsive dashboard navigation', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(ACCESS_TOKEN_KEY, 'stored-token')
    restoreSession.mockResolvedValue({
      displayName: 'Asha Bloom',
      email: 'asha@example.com',
      role: 'supporter',
      credits: 50,
    })

    renderAt('/dashboard/supporter')

    await screen.findByRole('heading', { name: /track every idea you back/i })
    await user.click(screen.getByRole('button', { name: /toggle dashboard navigation/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /toggle dashboard navigation/i })).toHaveAttribute(
        'aria-expanded',
        'true',
      )
    })
    expect(screen.getByRole('link', { name: /my contributions/i })).toHaveAttribute(
      'href',
      '/dashboard/supporter/contributions',
    )
  })
})
