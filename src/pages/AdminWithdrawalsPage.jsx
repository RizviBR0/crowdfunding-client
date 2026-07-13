import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
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
    {withdrawals.length > 0 ? <DataTable rows={withdrawals} caption="Creator withdrawal requests" columns={[
      { key: 'creatorName', label: 'Creator', render: (row) => <span className="campaign-title-cell"><strong>{row.creatorName}</strong><small>{row.creatorEmail}</small></span> },
      { key: 'credits', label: 'Credits', render: (row) => `${row.withdrawalCredit ?? row.credits} credits` },
      { key: 'dollars', label: 'Amount', render: (row) => `$${row.withdrawalAmountDollars ?? row.dollars}` },
      { key: 'paymentSystem', label: 'Payment', render: (row) => `${row.paymentSystem} · ${row.accountNumber}` },
      { key: 'createdAt', label: 'Requested', render: (row) => date(row.createdAt || row.date) },
      { key: 'status', label: 'Status', render: (row) => <span className={`status-chip status-chip--${row.status}`}>{row.status}</span> },
      { key: 'actions', label: 'Actions', render: (row) => row.status === 'pending' ? <span className="campaign-row-actions"><Button aria-label={`Payment Success for ${row.creatorName}`} icon={CheckCircle2} onClick={() => mutation.mutate({ withdrawalId: row.id, decision: 'approved' })}>Payment Success</Button><Button aria-label={`Reject ${row.creatorName}`} icon={XCircle} onClick={() => mutation.mutate({ withdrawalId: row.id, decision: 'rejected' })} variant="secondary">Reject</Button></span> : '—' },
    ]} /> : null}
    {mutation.isError ? <p className="form-message form-message--error" role="alert">{getApiErrorMessage(mutation.error)}</p> : null}
  </section>
}
