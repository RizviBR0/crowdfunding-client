import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'
import AppProviders from './app/AppProviders.jsx'

describe('client foundation', () => {
  it('renders through the router and query providers', () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(
      screen.getByRole('heading', { name: 'Crowdfunding Platform' }),
    ).toBeInTheDocument()
  })
})
