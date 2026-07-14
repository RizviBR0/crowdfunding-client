import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'

const renderAt = (path) => {
  window.history.pushState({}, '', path)

  render(
    <AppProviders>
      <App />
    </AppProviders>,
  )
}

describe('public information pages', () => {
  afterEach(() => {
    cleanup()
    window.history.pushState({}, '', '/')
  })

  it('renders the complete How It Works guide', () => {
    renderAt('/how-it-works')

    expect(screen.getByRole('heading', { name: /clear path from idea to impact/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /small actions, visible progress/i })).toBeInTheDocument()
    expect(screen.getByText(/what are fundbloom credits/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /explore campaigns/i })[0]).toHaveAttribute('href', '/explore')
  })

  it('renders featured stories and community voices', () => {
    renderAt('/stories')

    expect(screen.getByRole('heading', { name: /every campaign starts with a human story/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /change that grows outward/i })).toBeInTheDocument()
    expect(screen.getByText(/a library that keeps the light on/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /a little support can sound like a lot/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /share your idea/i })).toHaveAttribute('href', '/register')
  })
})
