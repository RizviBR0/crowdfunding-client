import { Link } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  Sparkles,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useAuth } from "../auth/useAuth.js";
import Button from "../components/ui/Button.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import Modal from "../components/ui/Modal.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import {
  decideCreatorContribution,
  getCreatorContribution,
  getCreatorPendingContributions,
  getSupporterContributionStats,
  listSupporterApprovedContributions,
} from "../services/campaignService.js";

const roleHomeContent = {
  supporter: {
    eyebrow: "Supporter home",
    title: "Track every idea you back.",
    description:
      "Your supporter dashboard will collect contribution stats, approved projects, and credit actions.",
    stats: [
      {
        label: "Total contributions",
        statKey: "totalContributions",
        value: "0",
        icon: BarChart3,
      },
      {
        label: "Pending contributions",
        statKey: "pendingContributions",
        value: "0",
        icon: Clock3,
      },
      {
        label: "Total amount approved",
        statKey: "totalApprovedAmount",
        value: "0",
        icon: WalletCards,
      },
    ],
    nextPath: "/dashboard/supporter/explore",
    nextLabel: "Explore campaigns",
  },
  creator: {
    eyebrow: "Creator home",
    title: "Prepare campaigns for real support.",
    description:
      "Your creator dashboard will show launched campaigns, active funding, raised credits, and reviews.",
    stats: [
      { label: "Campaigns launched", value: "0", icon: BarChart3 },
      { label: "Active campaigns", value: "0", icon: Clock3 },
      { label: "Credits raised", value: "0", icon: WalletCards },
    ],
    nextPath: "/dashboard/creator/campaigns/new",
    nextLabel: "Add new campaign",
  },
  admin: {
    eyebrow: "Admin home",
    title: "Keep FundBloom moving cleanly.",
    description:
      "Your admin dashboard will centralize users, campaign approvals, withdrawals, reports, and platform metrics.",
    stats: [
      { label: "Supporters", value: "0", icon: BarChart3 },
      { label: "Creators", value: "0", icon: Sparkles },
      { label: "Available credits", value: "0", icon: WalletCards },
    ],
    nextPath: "/dashboard/admin/campaigns",
    nextLabel: "Manage campaigns",
  },
};

const routeContent = {
  supporterExplore: {
    eyebrow: "Explore campaigns",
    title: "Approved campaigns will appear here.",
    description:
      "This route is reserved for the supporter dashboard discovery view after the campaign API slice lands.",
  },
  supporterContributions: {
    eyebrow: "My contributions",
    title: "Contribution history is next.",
    description:
      "Paginated supporter contributions will use this route once contributions are implemented.",
  },
  supporterCredits: {
    eyebrow: "Purchase credit",
    title: "Credit packages will connect to Stripe.",
    description:
      "The fixed server-owned packages and checkout flow will be added in the payment task.",
  },
  supporterPayments: {
    eyebrow: "Payment history",
    title: "Supporter payments will be listed here.",
    description: "This page is ready for owner-only Stripe payment records.",
  },
  creatorNewCampaign: {
    eyebrow: "Add new campaign",
    title: "Campaign creation will live here.",
    description:
      "The form will include campaign story, goal, deadline, reward, category, and imgBB image upload.",
  },
  creatorCampaigns: {
    eyebrow: "My campaigns",
    title: "Your campaigns table is waiting.",
    description:
      "Owner-only campaign management will arrive with update and delete/refund behavior.",
  },
  creatorWithdrawals: {
    eyebrow: "Withdrawals",
    title: "Creator earnings will connect here.",
    description:
      "Withdrawable credits, conversion, and request history will use this route.",
  },
  creatorPayments: {
    eyebrow: "Payment history",
    title: "Withdrawal payment history will be shown here.",
    description:
      "Approved withdrawal records will be listed after the withdrawal slice is implemented.",
  },
  adminUsers: {
    eyebrow: "Manage users",
    title: "User administration will live here.",
    description:
      "Admins will review roles, credits, profile data, and safe role/update actions from this route.",
  },
  adminCampaigns: {
    eyebrow: "Manage campaigns",
    title: "Campaign approvals will be handled here.",
    description:
      "Pending approval, rejection, and management actions will connect to admin campaign endpoints.",
  },
  adminWithdrawals: {
    eyebrow: "Withdrawal requests",
    title: "Creator payout approvals will live here.",
    description:
      "Admins will approve pending withdrawal requests and keep credit ledgers consistent.",
  },
  adminReports: {
    eyebrow: "Reports",
    title: "Reported campaigns will queue here.",
    description:
      "Suspicious campaign reports and resolution actions will be connected in the reports slice.",
  },
};

const formatCredits = (value) =>
  `${Number(value ?? 0).toLocaleString()} credits`;

const createIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() ??
  `creator-decision-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function ContributionDetailDialog({ contributionId, isOpen, onClose }) {
  const detailQuery = useQuery({
    enabled: isOpen && Boolean(contributionId),
    queryKey: ["creator-contribution", contributionId],
    queryFn: () => getCreatorContribution(contributionId),
  });
  const contribution = detailQuery.data;

  return (
    <Modal
      description="Review the supporter message and contribution details before deciding."
      isOpen={isOpen}
      onClose={onClose}
      title="View contribution"
    >
      {detailQuery.isLoading ? (
        <LoadingState label="Loading contribution detail" />
      ) : null}
      {detailQuery.isError ? (
        <EmptyState
          action={
            <Button
              icon={RefreshCw}
              onClick={() => detailQuery.refetch()}
              variant="secondary"
            >
              Try again
            </Button>
          }
          description={getApiErrorMessage(detailQuery.error)}
          title="Contribution detail could not load"
        />
      ) : null}
      {contribution ? (
        <div className="contribution-detail">
          <dl>
            <div>
              <dt>Supporter</dt>
              <dd>{contribution.supporterName}</dd>
            </div>
            <div>
              <dt>Campaign</dt>
              <dd>{contribution.campaignTitle}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatCredits(contribution.amount)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span
                  className={`status-chip status-chip--${contribution.status}`}
                >
                  {contribution.status}
                </span>
              </dd>
            </div>
          </dl>
          <article>
            <h4>Supporter message</h4>
            <p>
              {contribution.message ||
                "No message was included with this contribution."}
            </p>
          </article>
        </div>
      ) : null}
    </Modal>
  );
}

function CreatorContributionReview() {
  const queryClient = useQueryClient();
  const [selectedContributionId, setSelectedContributionId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusVariant, setStatusVariant] = useState("success");
  const contributionsQuery = useQuery({
    queryKey: ["creator-contributions", "pending", 1],
    queryFn: () => getCreatorPendingContributions({ page: 1, limit: 10 }),
  });
  const contributions = contributionsQuery.data?.contributions ?? [];

  const decisionMutation = useMutation({
    mutationFn: ({ contributionId, decision }) =>
      decideCreatorContribution({
        contributionId,
        decision,
        idempotencyKey: createIdempotencyKey(),
      }),
    onSuccess: async (contribution) => {
      setStatusVariant("success");
      setStatusMessage(
        contribution.status === "approved"
          ? "Contribution approved. Raised credits were updated."
          : "Contribution rejected. Supporter credits were refunded.",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["creator-contributions"] }),
        queryClient.invalidateQueries({
          queryKey: ["creator-contribution", contribution.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["creator-campaigns"] }),
      ]);
    },
    onError: (error) => {
      setStatusVariant("error");
      setStatusMessage(getApiErrorMessage(error));
    },
  });

  const decide = (contribution, decision) => {
    setStatusMessage("");
    setStatusVariant("success");
    decisionMutation.mutate({ contributionId: contribution.id, decision });
  };

  const columns = [
    { key: "supporterName", label: "Supporter" },
    {
      key: "campaignTitle",
      label: "Campaign",
      render: (contribution) => (
        <span className="campaign-title-cell">
          <strong>{contribution.campaignTitle}</strong>
          <small>{contribution.status}</small>
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (contribution) => formatCredits(contribution.amount),
    },
    {
      key: "actions",
      label: "Actions",
      render: (contribution) => (
        <span className="campaign-row-actions contribution-review-actions">
          <button
            aria-label={`View contribution from ${contribution.supporterName}`}
            onClick={() => setSelectedContributionId(contribution.id)}
            type="button"
          >
            <Eye aria-hidden="true" />
          </button>
          <button
            aria-label={`Approve contribution from ${contribution.supporterName}`}
            disabled={decisionMutation.isPending}
            onClick={() => decide(contribution, "approved")}
            type="button"
          >
            <CheckCircle2 aria-hidden="true" />
          </button>
          <button
            aria-label={`Reject contribution from ${contribution.supporterName}`}
            disabled={decisionMutation.isPending}
            onClick={() => decide(contribution, "rejected")}
            type="button"
          >
            <XCircle aria-hidden="true" />
          </button>
        </span>
      ),
    },
  ];

  return (
    <section
      className="creator-review-panel"
      aria-labelledby="creator-review-title"
    >
      <div className="creator-review-panel__header">
        <div>
          <p className="dashboard-page__eyebrow">Contributions to review</p>
          <h2 id="creator-review-title">Pending supporter contributions</h2>
          <p>
            Approve real support into raised credits, or reject and refund the
            supporter instantly.
          </p>
        </div>
        <Button
          disabled={contributionsQuery.isFetching}
          icon={RefreshCw}
          onClick={() => contributionsQuery.refetch()}
          variant="secondary"
        >
          Refresh
        </Button>
      </div>

      {statusMessage ? (
        <p
          aria-live="polite"
          className={`form-message form-message--${statusVariant}`}
        >
          {statusMessage}
        </p>
      ) : null}
      {contributionsQuery.isLoading ? (
        <LoadingState label="Loading pending contributions" />
      ) : null}
      {contributionsQuery.isError ? (
        <EmptyState
          action={
            <Button
              icon={RefreshCw}
              onClick={() => contributionsQuery.refetch()}
              variant="secondary"
            >
              Try again
            </Button>
          }
          description={getApiErrorMessage(contributionsQuery.error)}
          title="Pending contributions could not load"
        />
      ) : null}
      {!contributionsQuery.isLoading &&
      !contributionsQuery.isError &&
      contributions.length === 0 ? (
        <EmptyState
          description="New supporter contributions will appear here for approval or refund decisions."
          title="No pending contributions"
        />
      ) : null}
      {contributions.length > 0 ? (
        <DataTable
          caption="Pending creator contribution review"
          columns={columns}
          rows={contributions}
        />
      ) : null}

      <ContributionDetailDialog
        contributionId={selectedContributionId}
        isOpen={Boolean(selectedContributionId)}
        onClose={() => setSelectedContributionId(null)}
      />
    </section>
  );
}

function SupporterContributionHome() {
  const contributionsQuery = useQuery({
    queryKey: ["supporter-dashboard-approved"],
    queryFn: () => listSupporterApprovedContributions({ page: 1, limit: 10 }),
  });

  const contributions = contributionsQuery.data?.contributions ?? [];

  const columns = [
    { key: "campaignTitle", label: "Campaign" },
    {
      key: "amount",
      label: "Amount",
      render: (row) => formatCredits(row.amount),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <section
      aria-labelledby="supporter-approved-contributions-title"
      className="dashboard-section"
    >
      <header className="dashboard-section__header">
        <h2 id="supporter-approved-contributions-title">
          Approved contributions
        </h2>
        <Button
          icon={RefreshCw}
          isLoading={contributionsQuery.isFetching}
          onClick={() => contributionsQuery.refetch()}
          variant="secondary"
        >
          Refresh
        </Button>
      </header>

      {contributionsQuery.isLoading ? (
        <LoadingState label="Loading approved contributions" />
      ) : null}
      {contributionsQuery.isError ? (
        <EmptyState
          action={
            <Button
              icon={RefreshCw}
              onClick={() => contributionsQuery.refetch()}
              variant="secondary"
            >
              Try again
            </Button>
          }
          description={getApiErrorMessage(contributionsQuery.error)}
          title="Approved contributions could not load"
        />
      ) : null}
      {!contributionsQuery.isLoading &&
      !contributionsQuery.isError &&
      contributions.length === 0 ? (
        <EmptyState
          description="Approved contributions will appear here once campaigns accept your support."
          title="No approved contributions yet"
        />
      ) : null}
      {contributions.length > 0 ? (
        <DataTable
          caption="Approved supporter contributions"
          columns={columns}
          rows={contributions}
        />
      ) : null}
    </section>
  );
}

export function DashboardHomePage({ role }) {
  const { user } = useAuth();
  const content = roleHomeContent[role];

  const statsQuery = useQuery({
    enabled: role === "supporter",
    queryKey: ["supporter-stats"],
    queryFn: getSupporterContributionStats,
  });

  return (
    <section
      className="dashboard-page"
      aria-labelledby={`${role}-dashboard-title`}
    >
      <div className="dashboard-page__hero">
        <p className="dashboard-page__eyebrow">{content.eyebrow}</p>
        <h1 id={`${role}-dashboard-title`}>{content.title}</h1>
        <p>{content.description}</p>
        <Link className="button button--primary" to={content.nextPath}>
          <span>{content.nextLabel}</span>
          <ArrowRight aria-hidden="true" className="button__icon" />
        </Link>
      </div>

      <div
        className="dashboard-stat-grid"
        aria-label={`${role} dashboard summary`}
      >
        {content.stats.map((stat) => {
          const Icon = stat.icon;
          let value = stat.value;
          if (stat.valueKey) {
            value = String(user?.[stat.valueKey] ?? 0);
          } else if (stat.statKey && statsQuery.data) {
            value = String(statsQuery.data[stat.statKey] ?? 0);
          }

          return (
            <article className="dashboard-stat-card" key={stat.label}>
              <span>
                <Icon aria-hidden="true" />
              </span>
              <strong>
                {statsQuery.isLoading && stat.statKey ? "..." : value}
              </strong>
              <p>{stat.label}</p>
            </article>
          );
        })}
      </div>

      {role === "creator" ? <CreatorContributionReview /> : null}
      {role === "supporter" ? <SupporterContributionHome /> : null}
    </section>
  );
}

export function DashboardPlaceholderPage({ type }) {
  const content = routeContent[type];

  return (
    <section
      className="dashboard-page dashboard-page--placeholder"
      aria-labelledby={`${type}-dashboard-title`}
    >
      <p className="dashboard-page__eyebrow">{content.eyebrow}</p>
      <h1 id={`${type}-dashboard-title`}>{content.title}</h1>
      <p>{content.description}</p>
    </section>
  );
}
