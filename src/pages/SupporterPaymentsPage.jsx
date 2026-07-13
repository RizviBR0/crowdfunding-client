import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { getPaymentHistory } from '../services/paymentService.js'
import { getApiErrorMessage } from '../lib/api.js'

export default function SupporterPaymentsPage() {
  const [page, setPage] = useState(1)
  const limit = 10

  const historyQuery = useQuery({
    queryKey: ['supporter-payments', page, limit],
    queryFn: () => getPaymentHistory({ page, limit }),
  })

  const payments = historyQuery.data?.payments ?? []
  const meta = historyQuery.data?.meta

  const columns = [
    {
      key: 'packageId',
      label: 'Package',
      render: (row) => row.packageId.replace('package_', '') + ' Credits',
    },
    {
      key: 'amountCents',
      label: 'Amount Paid',
      align: 'right',
      render: (row) => `$${(row.amountCents / 100).toFixed(2)}`,
    },
    {
      key: 'credits',
      label: 'Credits Added',
      align: 'right',
      render: (row) => `+${row.credits}`,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`status-chip status-chip--${row.status === 'paid' ? 'approved' : row.status}`}>
          {row.status}
        </span>
      ),
    },
  ]

  return (
    <section className="dashboard-section" aria-labelledby="supporter-payments-title">
      <header className="dashboard-section__header">
        <h2 id="supporter-payments-title">Payment history</h2>
        <Button
          icon={RefreshCw}
          isLoading={historyQuery.isFetching}
          onClick={() => historyQuery.refetch()}
          variant="secondary"
        >
          Refresh
        </Button>
      </header>

      {historyQuery.isLoading ? (
        <LoadingState label="Loading payment history" />
      ) : null}

      {historyQuery.isError ? (
        <EmptyState
          action={
            <Button
              icon={RefreshCw}
              onClick={() => historyQuery.refetch()}
              variant="secondary"
            >
              Try again
            </Button>
          }
          description={getApiErrorMessage(historyQuery.error)}
          title="Payment history could not load"
        />
      ) : null}

      {!historyQuery.isLoading && !historyQuery.isError && payments.length === 0 ? (
        <EmptyState
          description="You have not purchased any credits yet. Your payments will appear here."
          title="No payment history"
        />
      ) : null}

      {payments.length > 0 ? (
        <DataTable
          caption="Supporter payment history"
          columns={columns}
          rows={payments}
        />
      ) : null}

      {meta && meta.totalPages > 1 && (
        <div className="pagination">
          <Button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            variant="secondary"
          >
            Previous
          </Button>
          <span className="pagination__info">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            disabled={page === meta.totalPages}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      )}
    </section>
  )
}
