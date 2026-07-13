import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import AppProviders from '../app/AppProviders.jsx'
import { ACCESS_TOKEN_KEY } from '../lib/tokenStorage.js'
import { restoreSession } from '../services/authService.js'
import { getAdminUsers, removeAdminUser, updateAdminUserRole } from '../services/adminService.js'

vi.mock('../services/authService.js', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  registerWithEmail: vi.fn(),
  restoreSession: vi.fn(),
}))

vi.mock('../services/adminService.js', async () => {
  const actual = await vi.importActual('../services/adminService.js')
  return {
    ...actual,
    getAdminUsers: vi.fn(),
    updateAdminUserRole: vi.fn(),
    removeAdminUser: vi.fn(),
  }
})

const adminUser = {
  displayName: 'Ada Admin',
  email: 'admin@example.com',
  role: 'admin',
  credits: 0,
}

const mockUsers = [
  {
    id: 'user_1',
    displayName: 'Chris Creator',
    email: 'creator@example.com',
    photoUrl: 'https://example.com/avatar.jpg',
    role: 'creator',
    credits: 20,
  },
  {
    id: 'user_2',
    displayName: 'Sam Supporter',
    email: 'supporter@example.com',
    photoUrl: '',
    role: 'supporter',
    credits: 75,
  },
]

const renderAt = (path) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, 'stored-token')
  restoreSession.mockResolvedValue(adminUser)
  window.history.pushState({}, '', path)

  render(
    <AppProviders>
      <App />
    </AppProviders>,
  )
}

describe('AdminUsersPage dashboard component', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
  })

  it('renders a custom responsive user table with avatars, role selectors, and credit badges', async () => {
    getAdminUsers.mockResolvedValue({
      users: mockUsers,
      meta: { page: 1, limit: 10, totalItems: 2, totalPages: 1 },
    })

    renderAt('/dashboard/admin/users')

    expect(await screen.findByRole('heading', { name: /keep the community trustworthy/i })).toBeInTheDocument()
    expect(await screen.findByText('Chris Creator')).toBeInTheDocument()
    expect(screen.getByText('creator@example.com')).toBeInTheDocument()

    // Assert that UserAvatar was rendered as an img for user_1
    const imgAvatar = document.querySelector('.user-avatar-img')
    expect(imgAvatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')

    // Assert that UserAvatar fallback was rendered as capital first letter 'S' for user_2
    expect(screen.getByText('S')).toBeInTheDocument()

    // Assert role select elements are customized
    const table = screen.getByRole('table')
    const roleSelects = within(table).getAllByRole('combobox')
    expect(roleSelects.length).toBe(2)
    expect(roleSelects[0]).toHaveValue('creator')
    expect(roleSelects[0]).toHaveClass('role-select', 'role-select--creator')
    expect(roleSelects[1]).toHaveValue('supporter')
    expect(roleSelects[1]).toHaveClass('role-select', 'role-select--supporter')

    // Assert credits badges
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('supports role update and user removal mutations', async () => {
    const user = userEvent.setup()
    getAdminUsers.mockResolvedValue({
      users: [mockUsers[0]],
      meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    })

    updateAdminUserRole.mockResolvedValue({ ...mockUsers[0], role: 'supporter' })
    removeAdminUser.mockResolvedValue({ success: true })

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderAt('/dashboard/admin/users')

    expect(await screen.findByText('Chris Creator')).toBeInTheDocument()

    // Update role
    const roleSelect = screen.getByRole('combobox', { name: /role for chris creator/i })
    fireEvent.change(roleSelect, { target: { value: 'supporter' } })

    await waitFor(() => {
      expect(updateAdminUserRole).toHaveBeenCalledWith({
        userId: 'user_1',
        role: 'supporter',
      }, expect.anything())
    })

    // Remove user
    const removeBtn = screen.getByRole('button', { name: /remove chris creator/i })
    await user.click(removeBtn)

    await waitFor(() => {
      expect(removeAdminUser).toHaveBeenCalledWith('user_1', expect.anything())
    })
  })
})
