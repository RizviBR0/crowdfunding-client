import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'
import { registerWithEmail } from '../services/authService.js'

vi.mock('../services/authService.js', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  registerWithEmail: vi.fn(),
}))

describe('auth pages', () => {
  afterEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('renders registration fields with role and profile image controls', () => {
    window.history.pushState({}, '', '/register')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    const form = screen.getByRole('form', { name: /register form/i })

    expect(screen.getByRole('heading', { name: /create your fundbloom account/i })).toBeInTheDocument()
    expect(within(form).getByLabelText(/name/i)).toBeInTheDocument()
    expect(within(form).getByLabelText(/email/i)).toBeInTheDocument()
    expect(within(form).getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(within(form).getByLabelText(/role/i)).toHaveValue('supporter')
    expect(within(form).getByLabelText(/profile picture url/i)).toBeInTheDocument()
    expect(within(form).getByLabelText(/upload image/i)).toBeInTheDocument()
  })

  it('validates weak registration passwords before calling Firebase', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/register')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    const form = screen.getByRole('form', { name: /register form/i })

    await user.type(within(form).getByLabelText(/name/i), 'Asha Bloom')
    await user.type(within(form).getByLabelText(/email/i), 'asha@example.com')
    await user.type(within(form).getByLabelText(/^password$/i), 'weak')
    await user.click(within(form).getByRole('button', { name: /create account/i }))

    expect(screen.getByText(/uppercase, lowercase, and a number/i)).toBeInTheDocument()
    expect(registerWithEmail).not.toHaveBeenCalled()
  })

  it('submits valid registration data and routes to the dashboard placeholder', async () => {
    const user = userEvent.setup()
    registerWithEmail.mockResolvedValue({
      displayName: 'Asha Bloom',
      email: 'asha@example.com',
      role: 'creator',
      credits: 20,
    })
    window.history.pushState({}, '', '/register')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    const form = screen.getByRole('form', { name: /register form/i })

    await user.type(within(form).getByLabelText(/name/i), 'Asha Bloom')
    await user.type(within(form).getByLabelText(/email/i), 'asha@example.com')
    await user.type(within(form).getByLabelText(/^password$/i), 'Strong1')
    await user.selectOptions(within(form).getByLabelText(/role/i), 'creator')
    await user.click(within(form).getByRole('button', { name: /create account/i }))

    expect(registerWithEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'asha@example.com',
        name: 'Asha Bloom',
        password: 'Strong1',
        role: 'creator',
      }),
    )
    expect(await screen.findByRole('heading', { name: /your dashboard is getting ready/i })).toBeInTheDocument()
  })
})
