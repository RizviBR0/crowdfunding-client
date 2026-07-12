import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, LayoutDashboard, LogOut, Menu, UserCircle, WalletCards, X } from 'lucide-react'
import BrandLogo from '../brand/BrandLogo.jsx'
import Button from '../ui/Button.jsx'
import { siteConfig } from '../../config/site.js'

function PublicNavbar({ viewer = null, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isLoggedIn = Boolean(viewer)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="site-header">
      <nav aria-label="Primary" className="site-nav">
        <BrandLogo />

        <div className="site-nav__links">
          {siteConfig.navigation.map((item) => (
            <NavLink className="site-nav__link" key={item.href} to={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="site-nav__actions">
          {isLoggedIn ? (
            <>
              <Link className="site-nav__credit" to="/dashboard">
                <WalletCards aria-hidden="true" />
                <span>{viewer.credits ?? 0} credits</span>
              </Link>
              <Link className="site-nav__profile" to="/dashboard">
                {viewer.photoUrl ? <img alt="" src={viewer.photoUrl} /> : <UserCircle aria-hidden="true" />}
                <span>{viewer.displayName || 'Dashboard'}</span>
              </Link>
              <Button icon={LogOut} onClick={onLogout} variant="ghost">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link className="site-nav__auth" to="/login">
                Login
              </Link>
              <Link className="site-nav__register" to="/register">
                Register
              </Link>
            </>
          )}
          <a className="site-nav__developer" href={siteConfig.repositoryUrl} rel="noreferrer" target="_blank">
            <span>Join as Developer</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <button
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          className="site-nav__toggle"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>

      {isMenuOpen ? (
        <div className="mobile-menu" id="mobile-menu">
          {siteConfig.navigation.map((item) => (
            <NavLink className="mobile-menu__link" key={item.href} onClick={closeMenu} to={item.href}>
              {item.label}
            </NavLink>
          ))}
          {isLoggedIn ? (
            <>
              <Link className="mobile-menu__link" onClick={closeMenu} to="/dashboard">
                <LayoutDashboard aria-hidden="true" />
                Dashboard
              </Link>
              <span className="mobile-menu__meta">{viewer.credits ?? 0} available credits</span>
              <Button icon={LogOut} onClick={onLogout} variant="ghost">
                Logout
              </Button>
            </>
          ) : (
            <div className="mobile-menu__auth">
              <Link onClick={closeMenu} to="/login">
                Login
              </Link>
              <Link onClick={closeMenu} to="/register">
                Register
              </Link>
            </div>
          )}
          <a className="mobile-menu__developer" href={siteConfig.repositoryUrl} rel="noreferrer" target="_blank">
            Join as Developer
          </a>
        </div>
      ) : null}
    </header>
  )
}

export default PublicNavbar
