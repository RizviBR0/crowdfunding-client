import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import { getApiErrorMessage } from "../lib/api.js";
import { listSupporterOwnedContributions } from "../services/campaignService.js";

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const formatCredits = (value) =>
  `${Number(value ?? 0).toLocaleString()} credits`;

function SupporterContributionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const query = useQuery({
    queryKey: ["supporter-contributions", status, page, limit],
    queryFn: () => listSupporterOwnedContributions({ status, page, limit }),
  });

  const contributions = query.data?.contributions ?? [];
  const meta = query.data?.meta;

  const setStatus = (newStatus) => {
    setSearchParams((prev) => {
      prev.set("status", newStatus);
      prev.set("page", "1");
      return prev;
    });
  };

  const movePage = (newPage) => {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  };

  const columns = [
    { key: "campaignTitle", label: "Campaign" },
    {
      key: "amount",
      label: "Amount",
      render: (row) => formatCredits(row.amount),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-chip status-chip--${row.status}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <section
      className="dashboard-page"
      aria-labelledby="supporter-contributions-title"
    >
      <header className="dashboard-page__hero">
        <p className="dashboard-page__eyebrow">My contributions</p>
        <h1 id="supporter-contributions-title">Contribution history</h1>
        <p>
          Review your pending, approved, and rejected contributions across all
          campaigns.
        </p>
      </header>

      <div className="admin-campaign-controls">
        <div
          className="status-tabs"
          role="tablist"
          aria-label="Filter contributions by status"
        >
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              aria-selected={status === tab.value}
              className={`status-tabs__tab${status === tab.value ? " status-tabs__tab--active" : ""}`}
              onClick={() => setStatus(tab.value)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? <LoadingState label="Loading contributions" /> : null}

      {query.isError ? (
        <EmptyState
          action={
            <Button
              icon={RefreshCw}
              onClick={() => query.refetch()}
              variant="secondary"
            >
              Try again
            </Button>
          }
          description={getApiErrorMessage(query.error)}
          title="Contributions could not load"
        />
      ) : null}

      {!query.isLoading && !query.isError && contributions.length === 0 ? (
        <EmptyState
          description="Try a different status filter or support a new campaign."
          title="No contributions match this view"
        />
      ) : null}

      {contributions.length > 0 ? (
        <>
          <DataTable
            caption="Supporter contributions"
            columns={columns}
            rows={contributions}
          />

          <div
            className="explore-pagination"
            aria-label="Contribution pagination"
          >
            <button
              className="button button--secondary"
              disabled={!meta?.hasPrev}
              onClick={() => movePage(page - 1)}
              type="button"
            >
              Previous
            </button>
            <span>
              Page {meta?.page ?? 1} of {meta?.totalPages ?? 1}
            </span>
            <button
              className="button button--secondary"
              disabled={!meta?.hasNext}
              onClick={() => movePage(page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default SupporterContributionsPage;
