# FundBloom

> Ideas. People. Impact.

## Description

FundBloom is a responsive crowdfunding platform where creators launch campaigns and supporters discover projects, purchase platform credits, and contribute to approved campaigns. Admins moderate campaigns, manage users, review withdrawals, and resolve reports.

## Live project and resources

- Live site: [crowdfunding-client-indol.vercel.app](https://crowdfunding-client-indol.vercel.app)
- Live API health check: [crowdfunding-server-cyan.vercel.app/api/v1/health](https://crowdfunding-server-cyan.vercel.app/api/v1/health)
- Client repository: [github.com/RizviBR0/crowdfunding-client](https://github.com/RizviBR0/crowdfunding-client)
- Server repository: [github.com/RizviBR0/crowdfunding-server](https://github.com/RizviBR0/crowdfunding-server)

## Technologies used

- React 19 with Vite 8
- React Router 7 and TanStack Query 5
- Axios for API communication
- Firebase Authentication for email/password and Google sign-in
- Swiper for hero and testimonial sliders
- Tailwind CSS 4, project CSS tokens, Lucide React, Boldonse, and Inter
- Node/Express, MongoDB, and Stripe through the companion API

## Core features

- Animated three-slide FundBloom homepage hero.
- Top-funded campaign and platform-impact sections.
- Responsive How It Works and Stories pages.
- Public campaign discovery with search, category, deadline, and funding-goal filters.
- Campaign detail pages with progress, rewards, and supporter contribution controls.
- Firebase email/password and Google authentication.
- Supporter and Creator registration roles with server-authoritative profiles.
- One-time registration credit grants: 50 credits for Supporters and 20 for Creators.
- Stripe credit packages: 100/$10, 300/$25, 800/$60, and 1500/$110.
- Idempotent supporter contributions with balance, minimum, and campaign-capacity checks.
- Paginated supporter contribution history with status filtering.
- Creator campaign creation, editing, deletion, and refund-safe moderation.
- Creator pending-contribution review with approve/reject actions and message details.
- Creator earnings, withdrawal conversion, and withdrawal payment history.
- Admin campaign approval, rejection, suspension, and refund-safe deletion.
- Admin withdrawal approval/rejection and user role management.
- Campaign reporting with admin suspend, delete, or dismiss resolution.
- Role-aware analytics and owner-scoped dashboard data.
- Dashboard notification popup with read state and outside-click close.
- Shared loading, empty, error, retry, and responsive states.

## Dependencies

Runtime dependencies include `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `axios`, `firebase`, `swiper`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `@fontsource/boldonse`, and `@fontsource/inter`.

Development dependencies include Vite, the React Vite plugin, ESLint, Vitest, JSDOM, and Testing Library packages.

## Run locally

### Prerequisites

- Node.js 20.19 or newer
- The FundBloom API running locally or a reachable API URL
- Firebase web-app configuration and an imgBB API key for authentication/profile or campaign image uploads

### Client setup

```bash
git clone https://github.com/RizviBR0/crowdfunding-client.git
cd crowdfunding-client
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`. Set `VITE_API_URL` to the API base path, normally `http://localhost:5000/api/v1`, then fill the Firebase and imgBB values in `.env`.

The client is available at `http://localhost:5173`.

### Quality checks

```bash
npm run lint
npm test
npm run build
```

## Assessment credentials

The assessment admin email and password are deployment credentials, not source-code configuration. Add them manually before submitting if required:

- Admin email: add the Firebase admin email configured in `ADMIN_BOOTSTRAP_EMAILS`.
- Admin password: add the corresponding Firebase Authentication password manually; never commit it to Git.

Never commit `.env`, Firebase private keys, MongoDB credentials, Stripe secrets, imgBB keys, JWT secrets, or real demo passwords.
