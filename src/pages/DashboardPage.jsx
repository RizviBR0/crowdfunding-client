import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Clock3, Sparkles, WalletCards } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'

const roleHomeContent = {
  supporter: {
    eyebrow: 'Supporter home',
    title: 'Track every idea you back.',
    description: 'Your supporter dashboard will collect contribution stats, approved projects, and credit actions.',
    stats: [
      { label: 'Total contributions', value: '0', icon: BarChart3 },
      { label: 'Pending contributions', value: '0', icon: Clock3 },
      { label: 'Available credits', valueKey: 'credits', icon: WalletCards },
    ],
    nextPath: '/dashboard/supporter/explore',
    nextLabel: 'Explore campaigns',
  },
  creator: {
    eyebrow: 'Creator home',
    title: 'Prepare campaigns for real support.',
    description: 'Your creator dashboard will show launched campaigns, active funding, raised credits, and reviews.',
    stats: [
      { label: 'Campaigns launched', value: '0', icon: BarChart3 },
      { label: 'Active campaigns', value: '0', icon: Clock3 },
      { label: 'Credits raised', value: '0', icon: WalletCards },
    ],
    nextPath: '/dashboard/creator/campaigns/new',
    nextLabel: 'Add new campaign',
  },
  admin: {
    eyebrow: 'Admin home',
    title: 'Keep FundBloom moving cleanly.',
    description: 'Your admin dashboard will centralize users, campaign approvals, withdrawals, reports, and platform metrics.',
    stats: [
      { label: 'Supporters', value: '0', icon: BarChart3 },
      { label: 'Creators', value: '0', icon: Sparkles },
      { label: 'Available credits', value: '0', icon: WalletCards },
    ],
    nextPath: '/dashboard/admin/campaigns',
    nextLabel: 'Manage campaigns',
  },
}

const routeContent = {
  supporterExplore: {
    eyebrow: 'Explore campaigns',
    title: 'Approved campaigns will appear here.',
    description: 'This route is reserved for the supporter dashboard discovery view after the campaign API slice lands.',
  },
  supporterContributions: {
    eyebrow: 'My contributions',
    title: 'Contribution history is next.',
    description: 'Paginated supporter contributions will use this route once contributions are implemented.',
  },
  supporterCredits: {
    eyebrow: 'Purchase credit',
    title: 'Credit packages will connect to Stripe.',
    description: 'The fixed server-owned packages and checkout flow will be added in the payment task.',
  },
  supporterPayments: {
    eyebrow: 'Payment history',
    title: 'Supporter payments will be listed here.',
    description: 'This page is ready for owner-only Stripe payment records.',
  },
  creatorNewCampaign: {
    eyebrow: 'Add new campaign',
    title: 'Campaign creation will live here.',
    description: 'The form will include campaign story, goal, deadline, reward, category, and imgBB image upload.',
  },
  creatorCampaigns: {
    eyebrow: 'My campaigns',
    title: 'Your campaigns table is waiting.',
    description: 'Owner-only campaign management will arrive with update and delete/refund behavior.',
  },
  creatorWithdrawals: {
    eyebrow: 'Withdrawals',
    title: 'Creator earnings will connect here.',
    description: 'Withdrawable credits, conversion, and request history will use this route.',
  },
  creatorPayments: {
    eyebrow: 'Payment history',
    title: 'Withdrawal payment history will be shown here.',
    description: 'Approved withdrawal records will be listed after the withdrawal slice is implemented.',
  },
  adminUsers: {
    eyebrow: 'Manage users',
    title: 'User administration will live here.',
    description: 'Admins will review roles, credits, profile data, and safe role/update actions from this route.',
  },
  adminCampaigns: {
    eyebrow: 'Manage campaigns',
    title: 'Campaign approvals will be handled here.',
    description: 'Pending approval, rejection, and management actions will connect to admin campaign endpoints.',
  },
  adminWithdrawals: {
    eyebrow: 'Withdrawal requests',
    title: 'Creator payout approvals will live here.',
    description: 'Admins will approve pending withdrawal requests and keep credit ledgers consistent.',
  },
  adminReports: {
    eyebrow: 'Reports',
    title: 'Reported campaigns will queue here.',
    description: 'Suspicious campaign reports and resolution actions will be connected in the reports slice.',
  },
}

export function DashboardHomePage({ role }) {
  const { user } = useAuth()
  const content = roleHomeContent[role]

  return (
    <section className="dashboard-page" aria-labelledby={`${role}-dashboard-title`}>
      <div className="dashboard-page__hero">
        <p className="dashboard-page__eyebrow">{content.eyebrow}</p>
        <h1 id={`${role}-dashboard-title`}>{content.title}</h1>
        <p>{content.description}</p>
        <Link className="button button--primary" to={content.nextPath}>
          <span>{content.nextLabel}</span>
          <ArrowRight aria-hidden="true" className="button__icon" />
        </Link>
      </div>

      <div className="dashboard-stat-grid" aria-label={`${role} dashboard summary`}>
        {content.stats.map((stat) => {
          const Icon = stat.icon
          const value = stat.valueKey ? String(user?.[stat.valueKey] ?? 0) : stat.value

          return (
            <article className="dashboard-stat-card" key={stat.label}>
              <span>
                <Icon aria-hidden="true" />
              </span>
              <strong>{value}</strong>
              <p>{stat.label}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function DashboardPlaceholderPage({ type }) {
  const content = routeContent[type]

  return (
    <section className="dashboard-page dashboard-page--placeholder" aria-labelledby={`${type}-dashboard-title`}>
      <p className="dashboard-page__eyebrow">{content.eyebrow}</p>
      <h1 id={`${type}-dashboard-title`}>{content.title}</h1>
      <p>{content.description}</p>
    </section>
  )
}
