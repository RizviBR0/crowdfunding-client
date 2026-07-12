import { Route, Routes } from 'react-router-dom'
import { DashboardRoleRedirect, GuestRoute, ProtectedRoute, RoleRoute } from './auth/AuthRoutes.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import { DashboardHomePage, DashboardPlaceholderPage } from './pages/DashboardPage.jsx'
import AdminCampaignPage from './pages/AdminCampaignPage.jsx'
import CreatorCampaignPage from './pages/CreatorCampaignPage.jsx'
import ExplorePage, { CampaignDetailPage } from './pages/ExplorePage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'

function App() {
  return (
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
            <Route
              element={<DashboardPlaceholderPage type="supporterContributions" />}
              path="supporter/contributions"
            />
            <Route element={<DashboardPlaceholderPage type="supporterCredits" />} path="supporter/credits" />
            <Route element={<DashboardPlaceholderPage type="supporterPayments" />} path="supporter/payments" />
          </Route>
          <Route element={<RoleRoute allowedRole="creator" />}>
            <Route element={<DashboardHomePage role="creator" />} path="creator" />
            <Route element={<CreatorCampaignPage mode="new" />} path="creator/campaigns/new" />
            <Route element={<CreatorCampaignPage mode="list" />} path="creator/campaigns" />
            <Route element={<DashboardPlaceholderPage type="creatorWithdrawals" />} path="creator/withdrawals" />
            <Route element={<DashboardPlaceholderPage type="creatorPayments" />} path="creator/payments" />
          </Route>
          <Route element={<RoleRoute allowedRole="admin" />}>
            <Route element={<DashboardHomePage role="admin" />} path="admin" />
            <Route element={<DashboardPlaceholderPage type="adminUsers" />} path="admin/users" />
            <Route element={<AdminCampaignPage />} path="admin/campaigns" />
            <Route element={<DashboardPlaceholderPage type="adminWithdrawals" />} path="admin/withdrawals" />
            <Route element={<DashboardPlaceholderPage type="adminReports" />} path="admin/reports" />
          </Route>
          <Route element={<NotFoundPage />} path="*" />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
