export const siteConfig = {
  name: 'FundBloom',
  tagline: 'Ideas. People. Impact.',
  description: 'The crowdfunding platform where creators and supporters come together to make ideas bloom.',
  repositoryUrl: import.meta.env.VITE_CLIENT_REPOSITORY_URL || 'https://github.com/RizviBR0/crowdfunding-client',
  navigation: [
    { label: 'Explore Campaigns', href: '/explore' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Stories', href: '/stories' },
  ],
  footerSections: [
    {
      title: 'Explore',
      links: [
        { label: 'Discover Campaigns', href: '/explore' },
        { label: 'Start a Campaign', href: '/register' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Success Stories', href: '/stories' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Creator Guide', href: '/stories' },
        { label: 'Supporter Guide', href: '/how-it-works' },
        { label: 'FAQ', href: '/stories' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/stories' },
        { label: 'Our Mission', href: '/how-it-works' },
        { label: 'Contact Us', href: 'mailto:hello@fundbloom.test' },
      ],
    },
  ],
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/RizviBR0/crowdfunding-client', shortLabel: 'GH' },
    { label: 'LinkedIn', href: import.meta.env.VITE_LINKEDIN_URL || 'https://www.linkedin.com/', shortLabel: 'in' },
    { label: 'Facebook', href: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/', shortLabel: 'f' },
  ],
  dashboardNavigation: {
    supporter: [
      { label: 'Home', href: '/dashboard/supporter' },
      { label: 'Explore Campaigns', href: '/dashboard/supporter/explore' },
      { label: 'My Contributions', href: '/dashboard/supporter/contributions' },
      { label: 'Purchase Credit', href: '/dashboard/supporter/credits' },
      { label: 'Payment History', href: '/dashboard/supporter/payments' },
    ],
    creator: [
      { label: 'Home', href: '/dashboard/creator' },
      { label: 'Add New Campaign', href: '/dashboard/creator/campaigns/new' },
      { label: 'My Campaigns', href: '/dashboard/creator/campaigns' },
      { label: 'Withdrawals', href: '/dashboard/creator/withdrawals' },
      { label: 'Payment History', href: '/dashboard/creator/payments' },
    ],
    admin: [
      { label: 'Home', href: '/dashboard/admin' },
      { label: 'Manage Users', href: '/dashboard/admin/users' },
      { label: 'Manage Campaigns', href: '/dashboard/admin/campaigns' },
      { label: 'Withdrawal Requests', href: '/dashboard/admin/withdrawals' },
      { label: 'Reports', href: '/dashboard/admin/reports' },
    ],
  },
}
