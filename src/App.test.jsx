import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'
import AppProviders from './app/AppProviders.jsx'

describe('client application shell', () => {
  it('renders a neutral product placeholder without design-system preview copy', () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByRole('heading', { name: 'LanternRaise' })).toBeInTheDocument()
    expect(screen.getByText(/crowdfunding platform/i)).toBeInTheDocument()
    expect(screen.queryByText(/design foundation/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/inspect primitives/i)).not.toBeInTheDocument()
  })
})
