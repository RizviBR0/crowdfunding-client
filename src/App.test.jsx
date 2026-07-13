import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'
import AppProviders from './app/AppProviders.jsx'
import PublicNavbar from './components/layout/PublicNavbar.jsx'
import { siteConfig } from './config/site.js'

describe('public layout shell', () => {
  it('renders the guest navigation, home shell, developer link, and footer', () => {
    window.history.pushState({}, '', '/')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getAllByRole('link', { name: /fundbloom home/i }).length).toBeGreaterThan(1)
    expect(screen.getByRole('heading', { name: /fund the ideas/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /explore the most supported ideas/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /simple steps/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /find the causes that inspire you/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /what supporters are saying/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /explore campaigns/i }).length).toBeGreaterThan(1)
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register')
    expect(screen.getAllByRole('link', { name: /join as developer/i })[0]).toHaveAttribute(
      'href',
      siteConfig.repositoryUrl,
    )
    expect(screen.getByRole('heading', { name: /stay in the loop/i })).toBeInTheDocument()
  })

  it('opens the responsive mobile menu', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    await user.click(screen.getByRole('button', { name: /toggle navigation/i }))

    expect(screen.getByRole('button', { name: /toggle navigation/i })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('link', { name: /how it works/i }).length).toBeGreaterThan(1)
    expect(screen.getAllByRole('link', { name: /join as developer/i }).length).toBeGreaterThan(1)
  })

  it('renders a not-found page inside the public layout', () => {
    window.history.pushState({}, '', '/missing-page')

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByRole('heading', { name: /has not bloomed yet/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })

  it('supports the logged-in navbar variant without auth logic', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PublicNavbar viewer={{ credits: 75, displayName: 'Asha' }} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /asha/i }))

    expect(screen.getByText('75 credits')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /75 credits/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })
})
