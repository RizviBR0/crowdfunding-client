import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { getApiErrorMessage } from '../lib/api.js'
import { getAdminUsers, removeAdminUser, updateAdminUserRole } from '../services/adminService.js'

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [role, setRole] = useState('all')
  const [search, setSearch] = useState('')
  const usersQuery = useQuery({ queryKey: ['admin-users', role, search], queryFn: () => getAdminUsers({ role, search }) })
  const roleMutation = useMutation({
    mutationFn: updateAdminUserRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
  const removeMutation = useMutation({
    mutationFn: removeAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
  const users = usersQuery.data?.users ?? []

  return (
    <section className="dashboard-page admin-workspace" aria-labelledby="admin-users-title">
      <div className="dashboard-page__hero">
        <p className="dashboard-page__eyebrow">Manage users</p>
        <h1 id="admin-users-title">Keep the community trustworthy.</h1>
        <p>Review profile access, update authoritative roles, and remove accounts only when safety checks allow it.</p>
      </div>
      <div className="admin-campaign-toolbar">
        <label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email" /></label>
        <label>Role<select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">All roles</option><option value="admin">Admin</option><option value="creator">Creator</option><option value="supporter">Supporter</option></select></label>
      </div>
      {usersQuery.isLoading ? <LoadingState label="Loading users" /> : null}
      {usersQuery.isError ? <EmptyState action={<Button icon={RefreshCw} onClick={() => usersQuery.refetch()} variant="secondary">Try again</Button>} description={getApiErrorMessage(usersQuery.error)} title="Users could not load" /> : null}
      {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? <EmptyState description="No users match this view." title="No users found" /> : null}
      {users.length > 0 ? <DataTable caption="FundBloom users" rows={users} columns={[
        { key: 'displayName', label: 'User', render: (user) => <span className="campaign-title-cell"><strong>{user.displayName}</strong><small>{user.email}</small></span> },
        { key: 'photoUrl', label: 'Photo URL', render: (user) => user.photoUrl || '—' },
        { key: 'role', label: 'Role', render: (user) => <select aria-label={`Role for ${user.displayName}`} value={user.role} onChange={(event) => roleMutation.mutate({ userId: user.id, role: event.target.value })}><option value="admin">Admin</option><option value="creator">Creator</option><option value="supporter">Supporter</option></select> },
        { key: 'credits', label: 'Credits', align: 'right' },
        { key: 'actions', label: 'Actions', render: (user) => <Button aria-label={`Remove ${user.displayName}`} icon={Trash2} onClick={() => { if (window.confirm(`Remove ${user.displayName}?`)) removeMutation.mutate(user.id) }} variant="danger">Remove</Button> },
      ]} /> : null}
      {(roleMutation.isError || removeMutation.isError) ? <p className="form-message form-message--error" role="alert">{getApiErrorMessage(roleMutation.error || removeMutation.error)}</p> : null}
      {roleMutation.isSuccess ? <p className="form-message form-message--success"><ShieldCheck aria-hidden="true" /> Role updated.</p> : null}
    </section>
  )
}
