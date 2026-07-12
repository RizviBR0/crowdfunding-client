import { Outlet } from 'react-router-dom'
import PublicFooter from '../components/layout/PublicFooter.jsx'
import PublicNavbar from '../components/layout/PublicNavbar.jsx'

function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-layout__main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
