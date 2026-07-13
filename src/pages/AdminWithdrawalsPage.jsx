import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { getApiErrorMessage } from '../lib/api.js'
import { approveAdminWithdrawal, getAdminWithdrawals, rejectAdminWithdrawal } from '../services/adminService.js'

const key = () => globalThis.crypto?.randomUUID?.() || `admin-withdrawal-${Date.now()}`
const date = (value) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : '—'

export default function AdminWithdrawalsPage() {
  const client = useQueryClient()
  const [status, setStatus] = useState('pending')
  const query = useQuery({ queryKey: ['admin-withdrawals', status], queryFn: () => getAdminWithdrawals({ status }) })
  const mutation = useMutation({
    mutationFn: ({ withdrawalId, decision }) => decision === 'approved' ? approveAdminWithdrawal({ withdrawalId, idempotencyKey: key() }) : rejectAdminWithdrawal({ withdrawalId, idempotencyKey: key() }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-withdrawals'] }),
  })
  const withdrawals = query.data?.withdrawals ?? []
  return <section className="dashboard-page admin-workspace" aria-labelledby="admin-withdrawals-title">
    <div className="dashboard-page__hero"><p className="dashboard-page__eyebrow">Withdrawal requests</p><h1 id="admin-withdrawals-title">Approve creator payouts with confidence.</h1><p>Payment Success approves a request once and keeps creator balances and ledgers consistent.</p></div>
    <div className="admin-status-tabs" role="tablist">{['pending', 'approved', 'rejected', 'all'].map((value) => <button className={status === value ? 'admin-status-tabs__button admin-status-tabs__button--active' : 'admin-status-tabs__button'} key={value} onClick={() => setStatus(value)} type="button">{value}</button>)}</div>
    {query.isLoading ? <LoadingState label="Loading withdrawal requests" /> : null}
    {query.isError ? <EmptyState action={<Button icon={RefreshCw} onClick={() => query.refetch()} variant="secondary">Try again</Button>} description={getApiErrorMessage(query.error)} title="Withdrawals could not load" /> : null}
    {!query.isLoading && !query.isError && withdrawals.length === 0 ? <EmptyState description="No withdrawal requests match this status." title="Nothing to review" /> : null}
    {withdrawals.length > 0 ? (
      <div className="table-shell withdrawal-table-shell">
        <table className="data-table responsive-table withdrawal-table">
          <caption className="sr-only">Creator withdrawal requests</caption>
          <thead>
            <tr>
              <th scope="col">Creator</th>
              <th scope="col" className="data-table__cell--right">Credits</th>
              <th scope="col" className="data-table__cell--right">Amount</th>
              <th scope="col">Payment</th>
              <th scope="col">Requested</th>
              <th scope="col">Status</th>
              <th scope="col" className="data-table__cell--right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((row) => (
              <tr key={row.id} className="withdrawal-table-row">
                <td className="withdrawal-creator-col" data-label="Creator">
                  <span className="campaign-title-cell">
                    <strong>{row.creatorName}</strong>
                    <small>{row.creatorEmail}</small>
                  </span>
                </td>
                <td className="withdrawal-credits-col data-table__cell--right" data-label="Credits">
                  {row.withdrawalCredit ?? row.credits} credits
                </td>
                <td className="withdrawal-amount-col data-table__cell--right" data-label="Amount">
                  ${row.withdrawalAmountCents ? (row.withdrawalAmountCents / 100).toFixed(2) : row.withdrawalAmountDollars ?? row.dollars}
                </td>
                <td className="withdrawal-payment-col" data-label="Payment">
                  {row.paymentSystem} &middot; {row.accountNumberEncryptedOrMasked || row.accountNumber}
                </td>
                <td className="withdrawal-requested-col" data-label="Requested">
                  {date(row.withdrawDate || row.createdAt || row.date)}
                </td>
                <td className="withdrawal-status-col" data-label="Status">
                  <span className={`status-chip status-chip--${row.status}`}>{row.status}</span>
                </td>
                <td className="withdrawal-actions-col data-table__cell--right" data-label="Actions">
                  {row.status === 'pending' ? (
                    <span className="campaign-row-actions admin-withdrawal-actions">
                      <button
                        aria-label={`Payment Success for ${row.creatorName}`}
                        className="action-btn action-btn--approve"
                        onClick={() => mutation.mutate({ withdrawalId: row.id, decision: 'approved' })}
                        type="button"
                      >
                        <CheckCircle2 aria-hidden="true" />
                      </button>
                      <button
                        aria-label={`Reject ${row.creatorName}`}
                        className="action-btn action-btn--reject"
                        onClick={() => mutation.mutate({ withdrawalId: row.id, decision: 'rejected' })}
                        type="button"
                      >
                        <XCircle aria-hidden="true" />
                      </button>
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null}
    {mutation.isError ? <p className="form-message form-message--error" role="alert">{getApiErrorMessage(mutation.error)}</p> : null}
  </section>
}
