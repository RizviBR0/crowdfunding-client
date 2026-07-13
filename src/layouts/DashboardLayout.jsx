import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, LogOut, Menu, WalletCards, X } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'
import BrandLogo from '../components/brand/BrandLogo.jsx'
import Button from '../components/ui/Button.jsx'
import UserAvatar from '../components/ui/UserAvatar.jsx'
import { siteConfig } from '../config/site.js'
import { getApiErrorMessage } from '../lib/api.js'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationService.js'

function NotificationMenu({ isOpen, onClose }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['notifications'], queryFn: () => getNotifications({ limit: 20 }), enabled: isOpen })
  const readMutation = useMutation({ mutationFn: markNotificationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) })
  const allReadMutation = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) })
  if (!isOpen) return null
  const notifications = query.data?.notifications ?? []
  return <div aria-label="Notifications" className="dashboard-notification-menu" role="dialog">
    <div className="dashboard-notification-menu__header"><strong>Notifications</strong><button disabled={allReadMutation.isPending || notifications.every((item) => item.readAt)} onClick={() => allReadMutation.mutate()} type="button">Mark all read</button></div>
    {query.isLoading ? <p>Loading notifications…</p> : null}
    {query.isError ? <p className="form-message form-message--error">{getApiErrorMessage(query.error)}</p> : null}
    {!query.isLoading && notifications.length === 0 ? <p>No new updates yet.</p> : null}
    {notifications.map((item) => <button className={`dashboard-notification-menu__item${item.readAt ? '' : ' dashboard-notification-menu__item--unread'}`} key={item.id} onClick={() => { if (!item.readAt) readMutation.mutate(item.id); onClose(); if (item.actionRoute) navigate(item.actionRoute) }} type="button"><strong>{item.message}</strong><small>{item.time ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.time)) : ''}</small></button>)}
  </div>
}

function DashboardLayout() {
  const { logout, user } = useAuth()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationRef = useRef(null)
  const navigation = siteConfig.dashboardNavigation[user?.role] || []

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

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
            <div className="dashboard-notification-wrap" ref={notificationRef}>
            <button aria-expanded={isNotificationsOpen} aria-label="Open notifications" className="dashboard-notification" onClick={() => setIsNotificationsOpen((current) => !current)} type="button">
              <Bell aria-hidden="true" />
            </button>
            <NotificationMenu isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
            </div>
            <div className="dashboard-user">
              <UserAvatar user={user} />
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
                end
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
