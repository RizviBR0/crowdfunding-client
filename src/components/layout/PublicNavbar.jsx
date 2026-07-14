import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, LayoutDashboard, LogOut, Menu, WalletCards, X } from 'lucide-react'
import BrandLogo from '../brand/BrandLogo.jsx'
import Button from '../ui/Button.jsx'
import UserAvatar from '../ui/UserAvatar.jsx'
import { siteConfig } from '../../config/site.js'

function PublicNavbar({ viewer = null, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const isLoggedIn = Boolean(viewer)
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
              {(viewer?.role === 'supporter' || viewer?.role === 'creator') && (
                <Link className="dashboard-credit" to={viewer?.role === 'creator' ? '/dashboard/creator/withdrawals' : '/dashboard/supporter/credits'} style={{ textDecoration: 'none' }}>
                  <WalletCards aria-hidden="true" size={16} />
                  <span>{viewer.credits ?? 0} credits</span>
                </Link>
              )}
              <div className="site-nav__user-menu" ref={profileMenuRef}>
              <button
                className="site-nav__user-menu-trigger"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
              >
                <UserAvatar user={viewer} />
              </button>

              {isProfileMenuOpen && (
                <div className="site-nav__user-dropdown">
                  <div className="user-dropdown__header">
                    <span className="user-dropdown__name">{viewer.displayName || 'User'}</span>
                  </div>
                  <Link className="user-dropdown__item" to="/dashboard" onClick={() => setIsProfileMenuOpen(false)}>
                    <LayoutDashboard aria-hidden="true" size={16} />
                    <span>Dashboard</span>
                  </Link>
                  {(viewer?.role === 'supporter' || viewer?.role === 'creator') && (
                    <Link className="user-dropdown__item" to={viewer?.role === 'creator' ? '/dashboard/creator/withdrawals' : '/dashboard/supporter/credits'} onClick={() => setIsProfileMenuOpen(false)}>
                      <WalletCards aria-hidden="true" size={16} />
                      <span>{viewer.credits ?? 0} credits</span>
                    </Link>
                  )}
                  <button className="user-dropdown__item user-dropdown__logout" onClick={onLogout}>
                    <LogOut aria-hidden="true" size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
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
              {(viewer?.role === 'supporter' || viewer?.role === 'creator') && (
                <Link className="mobile-menu__link" onClick={closeMenu} to={viewer?.role === 'creator' ? '/dashboard/creator/withdrawals' : '/dashboard/supporter/credits'}>
                  <WalletCards aria-hidden="true" />
                  {viewer.credits ?? 0} available credits
                </Link>
              )}
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
