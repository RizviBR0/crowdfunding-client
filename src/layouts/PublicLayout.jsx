import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import PublicFooter from '../components/layout/PublicFooter.jsx'
import PublicNavbar from '../components/layout/PublicNavbar.jsx'

function PublicLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="public-layout">
      <PublicNavbar onLogout={logout} viewer={user} />
      <main className="public-layout__main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
