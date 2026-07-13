# FundBloom

FundBloom is a MongoDB, Express, React, and Node crowdfunding platform for discovering campaigns, purchasing supporter credits, contributing to approved projects, and managing creator payouts.

Features:

- Three-slide animated public homepage hero.
- Top-funded campaign impact section.
- Responsive public campaign discovery and detail pages.
- Search, category, deadline, and funding-goal filters.
- Firebase email/password and Google authentication.
- Supporter and Creator role selection with server-authoritative profiles.
- One-time registration credit grants.
- Stripe credit packages: 100/$10, 300/$25, 800/$60, and 1500/$110.
- Idempotent supporter contributions with server-side balance checks.
- Creator campaign creation, editing, deletion, and refund-safe moderation.
- Creator pending-contribution review with approve/reject actions.
- Creator earnings, withdrawal conversion, and payment history.
- Admin campaign moderation and refund-safe deletion.
- Admin withdrawal approval and rejection workflow.
- Admin user role management with last-admin and self-delete safety checks.
- Campaign reporting and admin suspend/delete/dismiss resolution.
- Role-aware analytics cards and owner-scoped data access.
- Dashboard notification popup with read state and outside-click close.
- Shared loading, empty, error, and recovery states with responsive layouts.

## Assessment submission details

- Website name: FundBloom
- Admin username/email: configured through the server `ADMIN_BOOTSTRAP_EMAILS` environment variable for the assessment deployment.
- Admin password: managed by Firebase Authentication and intentionally not committed to this repository.
- Live frontend URL: https://crowdfunding-client-indol.vercel.app
- Live API URL: https://crowdfunding-server-cyan.vercel.app
- Client repository: https://github.com/RizviBR0/crowdfunding-client
- Server repository: https://github.com/RizviBR0/crowdfunding-server

## Local development

Copy `.env.example` to `.env`, fill in the Firebase, MongoDB, Stripe, and imgBB values, then run `npm install` and `npm run dev`. The API defaults to `http://localhost:5000/api/v1`; configure `VITE_API_URL` for another server URL.

Never commit `.env`, Firebase private keys, MongoDB credentials, Stripe secrets, imgBB keys, or JWT secrets.
