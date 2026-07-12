import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Bell, LogOut, Menu, UserCircle, WalletCards, X } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'
import BrandLogo from '../components/brand/BrandLogo.jsx'
import Button from '../components/ui/Button.jsx'
import { siteConfig } from '../config/site.js'

function DashboardLayout() {
  const { logout, user } = useAuth()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const navigation = siteConfig.dashboardNavigation[user?.role] || []

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header__inner">
          <BrandLogo />

          <div className="dashboard-header__meta">
            <span className="dashboard-credit">
              <WalletCards aria-hidden="true" />
              {user?.credits ?? 0} credits
            </span>
            <button aria-label="Open notifications" className="dashboard-notification" type="button">
              <Bell aria-hidden="true" />
            </button>
            <div className="dashboard-user">
              {user?.photoUrl ? <img alt="" src={user.photoUrl} /> : <UserCircle aria-hidden="true" />}
              <span>
                <strong>{user?.displayName || 'FundBloom member'}</strong>
                <small>{user?.role || 'member'}</small>
              </span>
            </div>
            <Button icon={LogOut} onClick={logout} variant="ghost">
              Logout
            </Button>
            <button
              aria-controls="dashboard-navigation"
              aria-expanded={isNavOpen}
              aria-label="Toggle dashboard navigation"
              className="dashboard-nav-toggle"
              onClick={() => setIsNavOpen((current) => !current)}
              type="button"
            >
              {isNavOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-shell">
        <aside className={`dashboard-sidebar${isNavOpen ? ' dashboard-sidebar--open' : ''}`} id="dashboard-navigation">
          <p className="dashboard-sidebar__label">Navigation</p>
          <nav aria-label="Dashboard">
            {navigation.map((item) => (
              <NavLink
                className="dashboard-sidebar__link"
                end={item.href === `/dashboard/${user?.role}`}
                key={item.href}
                onClick={() => setIsNavOpen(false)}
                to={item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link className="dashboard-sidebar__public" to="/">
            Back to public site
          </Link>
        </aside>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      <footer className="dashboard-footer">
        <span>FundBloom dashboard</span>
        <span>Built for transparent crowdfunding.</span>
      </footer>
    </div>
  )
}

export default DashboardLayout
