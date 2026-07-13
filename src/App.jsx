import { Route, Routes } from 'react-router-dom'
import { DashboardRoleRedirect, GuestRoute, ProtectedRoute, RoleRoute } from './auth/AuthRoutes.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import { DashboardHomePage } from './pages/DashboardPage.jsx'
import AdminCampaignPage from './pages/AdminCampaignPage.jsx'
import CreatorCampaignPage from './pages/CreatorCampaignPage.jsx'
import CreatorWithdrawalsPage, { CreatorPaymentsPage } from './pages/CreatorWithdrawalsPage.jsx'
import ExplorePage, { CampaignDetailPage } from './pages/ExplorePage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import SupporterContributionsPage from './pages/SupporterContributionsPage.jsx'
import SupporterCreditsPage from './pages/SupporterCreditsPage.jsx'
import SupporterPaymentsPage from './pages/SupporterPaymentsPage.jsx'
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'
import AdminWithdrawalsPage from './pages/AdminWithdrawalsPage.jsx'
import AdminReportsPage from './pages/AdminReportsPage.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

function App() {
  return (<ErrorBoundary>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<ExplorePage />} path="explore" />
        <Route element={<CampaignDetailPage />} path="campaigns/:campaignId" />
        <Route element={<PlaceholderPage type="howItWorks" />} path="how-it-works" />
        <Route element={<PlaceholderPage type="stories" />} path="stories" />
        <Route element={<GuestRoute />}>
          <Route element={<AuthPage mode="login" />} path="login" />
          <Route element={<AuthPage mode="register" />} path="register" />
        </Route>
        <Route element={<NotFoundPage />} path="*" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />} path="dashboard">
          <Route index element={<DashboardRoleRedirect />} />
          <Route element={<RoleRoute allowedRole="supporter" />}>
            <Route element={<DashboardHomePage role="supporter" />} path="supporter" />
            <Route element={<ExplorePage surface="dashboard" />} path="supporter/explore" />
            <Route element={<SupporterContributionsPage />} path="supporter/contributions" />
            <Route element={<SupporterCreditsPage />} path="supporter/credits" />
            <Route element={<SupporterPaymentsPage />} path="supporter/payments" />
            <Route element={<PaymentSuccessPage />} path="supporter/payments/success" />
          </Route>
          <Route element={<RoleRoute allowedRole="creator" />}>
            <Route element={<DashboardHomePage role="creator" />} path="creator" />
            <Route element={<CreatorCampaignPage mode="new" />} path="creator/campaigns/new" />
            <Route element={<CreatorCampaignPage mode="list" />} path="creator/campaigns" />
            <Route element={<CreatorWithdrawalsPage />} path="creator/withdrawals" />
            <Route element={<CreatorPaymentsPage />} path="creator/payments" />
          </Route>
          <Route element={<RoleRoute allowedRole="admin" />}>
            <Route element={<DashboardHomePage role="admin" />} path="admin" />
            <Route element={<AdminUsersPage />} path="admin/users" />
            <Route element={<AdminCampaignPage />} path="admin/campaigns" />
            <Route element={<AdminWithdrawalsPage />} path="admin/withdrawals" />
            <Route element={<AdminReportsPage />} path="admin/reports" />
          </Route>
          <Route element={<NotFoundPage />} path="*" />
        </Route>
      </Route>
    </Routes>
  </ErrorBoundary>)
}

export default App
