import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

const dashboardHomeByRole = {
  supporter: '/dashboard/supporter',
  creator: '/dashboard/creator',
  admin: '/dashboard/admin',
}

const getDashboardHomeForRole = (role) => dashboardHomeByRole[role] || '/dashboard'

function AuthGate({ children }) {
  const { isAuthLoading, isAuthRestored } = useAuth()

  if (!isAuthRestored || isAuthLoading) {
    return (
      <section className="auth-gate" aria-live="polite">
        <p>Loading your FundBloom session...</p>
      </section>
    )
  }

  return children
}

export function GuestRoute() {
  const { isAuthenticated, user } = useAuth()

  return (
    <AuthGate>
      {isAuthenticated ? <Navigate replace to={getDashboardHomeForRole(user?.role)} /> : <Outlet />}
    </AuthGate>
  )
}

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  return (
    <AuthGate>
      {isAuthenticated ? <Outlet /> : <Navigate replace state={{ from: location }} to="/login" />}
    </AuthGate>
  )
}

export function RoleRoute({ allowedRole }) {
  const { user } = useAuth()

  if (user?.role !== allowedRole) {
    return <Navigate replace to={getDashboardHomeForRole(user?.role)} />
  }

  return <Outlet />
}

export function DashboardRoleRedirect() {
  const { user } = useAuth()

  return <Navigate replace to={getDashboardHomeForRole(user?.role)} />
}
