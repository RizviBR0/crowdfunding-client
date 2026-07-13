import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, ShieldAlert, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { getApiErrorMessage } from '../lib/api.js'
import { getAdminReports, resolveAdminReport } from '../services/adminService.js'

export default function AdminReportsPage() {
  const client = useQueryClient()
  const [status, setStatus] = useState('open')
  const query = useQuery({ queryKey: ['admin-reports', status], queryFn: () => getAdminReports({ status }) })
  const mutation = useMutation({ mutationFn: resolveAdminReport, onSuccess: () => client.invalidateQueries({ queryKey: ['admin-reports'] }) })
  const reports = query.data?.reports ?? []
  return <section className="dashboard-page admin-workspace" aria-labelledby="admin-reports-title">
    <div className="dashboard-page__hero"><p className="dashboard-page__eyebrow">Reports</p><h1 id="admin-reports-title">Handle concerns before they grow.</h1><p>Review the reporter, campaign, reason, and date before dismissing, suspending, or deleting.</p></div>
    <div className="admin-status-tabs" role="tablist">{['open', 'resolved', 'all'].map((value) => <button className={status === value ? 'admin-status-tabs__button admin-status-tabs__button--active' : 'admin-status-tabs__button'} key={value} onClick={() => setStatus(value)} type="button">{value}</button>)}</div>
    {query.isLoading ? <LoadingState label="Loading reports" /> : null}
    {query.isError ? <EmptyState action={<Button icon={RefreshCw} onClick={() => query.refetch()} variant="secondary">Try again</Button>} description={getApiErrorMessage(query.error)} title="Reports could not load" /> : null}
    {!query.isLoading && !query.isError && reports.length === 0 ? <EmptyState description="No reports match this view." title="No reports" /> : null}
    {reports.length > 0 ? <DataTable rows={reports} caption="Campaign reports" columns={[
      { key: 'reporterName', label: 'Reporter', render: (row) => <span className="campaign-title-cell"><strong>{row.reporterName}</strong><small>{row.reporterEmail}</small></span> },
      { key: 'campaignTitle', label: 'Campaign' },
      { key: 'reason', label: 'Reason' },
      { key: 'createdAt', label: 'Date', render: (row) => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(row.createdAt)) },
      { key: 'status', label: 'Status', render: (row) => <span className={`status-chip status-chip--${row.status}`}>{row.status}</span> },
      { key: 'actions', label: 'Actions', render: (row) => row.status === 'open' ? <span className="campaign-row-actions"><Button icon={ShieldAlert} onClick={() => mutation.mutate({ reportId: row.id, action: 'suspend' })}>Suspend</Button><Button icon={Trash2} onClick={() => mutation.mutate({ reportId: row.id, action: 'delete' })} variant="danger">Delete</Button><Button onClick={() => mutation.mutate({ reportId: row.id, action: 'dismiss' })} variant="ghost">Dismiss</Button></span> : '—' },
    ]} /> : null}
    {mutation.isError ? <p className="form-message form-message--error" role="alert">{getApiErrorMessage(mutation.error)}</p> : null}
  </section>
}
