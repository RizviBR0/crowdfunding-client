import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'
import AppProviders from './app/AppProviders.jsx'

describe('client design foundation', () => {
  it('renders the design-system preview through the router and query providers', () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(
      screen.getByRole('heading', { name: /warmer, sharper visual system/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Contribution review preview' })).toBeInTheDocument()
  })

  it('opens and closes the preview modal', async () => {
    const user = userEvent.setup()

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    await user.click(screen.getByRole('button', { name: /preview review modal/i }))

    expect(screen.getByRole('dialog', { name: /supporter note for river school solar lab/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close preview modal/i }))

    expect(screen.queryByRole('dialog', { name: /supporter note for river school solar lab/i })).not.toBeInTheDocument()
  })
})
