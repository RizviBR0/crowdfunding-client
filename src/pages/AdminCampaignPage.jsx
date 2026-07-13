import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, RefreshCw, Search, ShieldAlert, Trash2, XCircle } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Modal from '../components/ui/Modal.jsx'
import { getApiErrorMessage } from '../lib/api.js'
import {
  decideAdminCampaign,
  deleteAdminCampaign,
  getAdminCampaigns,
  suspendAdminCampaign,
} from '../services/campaignService.js'

const statusTabs = [
  { label: 'Pending', value: 'pending' },
  { label: 'All', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Deleted', value: 'deleted' },
]

const actionConfig = {
  approve: {
    title: 'Approve campaign',
    description: 'Approval makes the campaign eligible for supporter discovery when public Explore is connected.',
    button: 'Approve campaign',
    icon: CheckCircle2,
    variant: 'primary',
  },
  reject: {
    title: 'Reject campaign',
    description: 'Rejection keeps the campaign out of supporter discovery and notifies the creator.',
    button: 'Reject campaign',
    icon: XCircle,
    variant: 'secondary',
  },
  suspend: {
    title: 'Suspend campaign',
    description: 'Suspension hides the campaign without refunding supporters. Use delete when refunds are required.',
    button: 'Suspend campaign',
    icon: ShieldAlert,
    variant: 'secondary',
  },
  delete: {
    title: 'Delete campaign',
    description: 'Delete soft-hides the campaign and refunds eligible pending or approved contributions.',
    button: 'Delete and refund',
    icon: Trash2,
    variant: 'danger',
  },
}

const formatDate = (value) => {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const formatCredits = (value) => `${Number(value ?? 0).toLocaleString()} credits`

function AdminCampaignActionDialog({ action, campaign, isOpen, onClose }) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const config = actionConfig[action]
  const Icon = config?.icon

  const mutation = useMutation({
    mutationFn: async () => {
      const trimmedReason = reason.trim()

      if (action === 'suspend' && trimmedReason.length < 3) {
        throw new Error('Add a short suspension reason.')
      }

      if (action === 'approve' || action === 'reject') {
        return {
          campaign: await decideAdminCampaign({
            campaignId: campaign.id,
            decision: action === 'approve' ? 'approved' : 'rejected',
            reason: trimmedReason,
          }),
        }
      }

      if (action === 'suspend') {
        return {
          campaign: await suspendAdminCampaign({
            campaignId: campaign.id,
            reason: trimmedReason,
          }),
        }
      }

      return deleteAdminCampaign({
        campaignId: campaign.id,
        reason: trimmedReason,
      })
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })

      if (action === 'delete') {
        setMessage(
          `Campaign deleted. Refunded ${result.refund.refundedContributions} contributions worth ${result.refund.refundedCredits} credits.`,
        )
        return
      }

      onClose()
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  })

  if (!config || !campaign) {
    return null
  }

  return (
    <Modal description={config.description} isOpen={isOpen} onClose={onClose} title={config.title}>
      <form
        aria-label={`${config.title} form`}
        className="campaign-form campaign-form--compact admin-action-form"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <p>
          Review <strong>{campaign.title}</strong> by {campaign.creatorName}.
        </p>
        <label>
          <span>{action === 'approve' ? 'Decision note' : 'Reason'}</span>
          <textarea
            rows="3"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setMessage('')
            }}
            placeholder={
              action === 'approve'
                ? 'Optional note for the moderation record'
                : 'Add a clear moderation reason'
            }
          />
        </label>
        <div className="campaign-form__actions">
          <Button disabled={mutation.isPending || (action === 'delete' && Boolean(message))} icon={Icon} type="submit" variant={config.variant}>
            {mutation.isPending ? 'Working' : config.button}
          </Button>
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </div>
        {message ? <p aria-live="polite">{message}</p> : null}
      </form>
    </Modal>
  )
}

function AdminCampaignPage() {
  const [activeStatus, setActiveStatus] = useState('pending')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [dialogState, setDialogState] = useState(null)

  const campaignsQuery = useQuery({
    queryKey: ['admin-campaigns', activeStatus, search],
    queryFn: () => getAdminCampaigns({ status: activeStatus, search, page: 1, limit: 10 }),
  })
  const campaigns = campaignsQuery.data?.campaigns ?? []
  const pendingCount = campaigns.filter((campaign) => campaign.status === 'pending').length



  return (
    <section className="dashboard-page campaign-workspace admin-campaign-workspace" aria-labelledby="admin-campaigns-title">
      <div className="dashboard-page__hero campaign-workspace__hero admin-campaign-hero">
        <div>
          <p className="dashboard-page__eyebrow">Manage campaigns</p>
          <h1 id="admin-campaigns-title">Review campaigns with a steady hand.</h1>
          <p>
            Approve ready campaigns, reject incomplete submissions, suspend suspicious projects, or delete and refund
            when money must be protected.
          </p>
        </div>
        <div className="admin-campaign-summary" aria-label="Campaign moderation summary">
          <strong>{campaignsQuery.data?.meta?.totalItems ?? 0}</strong>
          <span>{activeStatus === 'all' ? 'matching campaigns' : `${activeStatus} campaigns`}</span>
          <small>{pendingCount} pending in this view</small>
        </div>
      </div>

      <div className="admin-campaign-toolbar" aria-label="Campaign management filters">
        <div className="admin-status-tabs" role="tablist" aria-label="Campaign status">
          {statusTabs.map((tab) => (
            <button
              aria-selected={activeStatus === tab.value}
              className={activeStatus === tab.value ? 'admin-status-tabs__button admin-status-tabs__button--active' : 'admin-status-tabs__button'}
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form
          className="admin-campaign-search"
          onSubmit={(event) => {
            event.preventDefault()
            setSearch(searchInput.trim())
          }}
        >
          <label>
            <span>Search campaigns</span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Title, creator, category"
            />
          </label>
          <Button icon={Search} type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {campaignsQuery.isLoading ? <LoadingState label="Loading admin campaigns" /> : null}
      {campaignsQuery.isError ? (
        <EmptyState
          action={<Button icon={RefreshCw} onClick={() => campaignsQuery.refetch()} variant="secondary">Try again</Button>}
          description={getApiErrorMessage(campaignsQuery.error)}
          title="Campaigns could not load"
        />
      ) : null}
      {!campaignsQuery.isLoading && !campaignsQuery.isError && campaigns.length === 0 ? (
        <EmptyState
          description="Try another status tab or search term."
          title="No campaigns match this view"
        />
      ) : null}
      {campaigns.length > 0 ? (
        <div className="table-shell campaign-table-shell">
          <table className="data-table responsive-table campaign-table">
            <caption className="sr-only">Admin campaign management table</caption>
            <thead>
              <tr>
                <th scope="col">Campaign</th>
                <th scope="col">Creator</th>
                <th scope="col">Deadline</th>
                <th scope="col" className="data-table__cell--right">Goal</th>
                <th scope="col" className="data-table__cell--right">Raised</th>
                <th scope="col">Status</th>
                <th scope="col" className="data-table__cell--right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="campaign-table-row">
                  <td className="campaign-title-col" data-label="Campaign">
                    <span className="campaign-title-cell">
                      <strong>{campaign.title}</strong>
                      <small>{campaign.category}</small>
                    </span>
                  </td>
                  <td className="campaign-creator-col" data-label="Creator">
                    <span className="campaign-title-cell campaign-title-cell--compact">
                      <strong>{campaign.creatorName}</strong>
                      <small>{campaign.creatorEmail}</small>
                    </span>
                  </td>
                  <td className="campaign-deadline-col" data-label="Deadline">
                    {formatDate(campaign.deadline)}
                  </td>
                  <td className="campaign-goal-col data-table__cell--right" data-label="Goal">
                    {formatCredits(campaign.fundingGoal)}
                  </td>
                  <td className="campaign-raised-col data-table__cell--right" data-label="Raised">
                    {formatCredits(campaign.amountRaised)}
                  </td>
                  <td className="campaign-status-col" data-label="Status">
                    <span className={`status-chip status-chip--${campaign.status}`}>{campaign.status}</span>
                  </td>
                  <td className="campaign-actions-col data-table__cell--right" data-label="Actions">
                    <span className="campaign-row-actions admin-campaign-actions">
                      {campaign.status === 'pending' ? (
                        <>
                          <button aria-label={`Approve ${campaign.title}`} onClick={() => setDialogState({ action: 'approve', campaign })} type="button" className="action-btn action-btn--approve">
                            <CheckCircle2 aria-hidden="true" />
                          </button>
                          <button aria-label={`Reject ${campaign.title}`} onClick={() => setDialogState({ action: 'reject', campaign })} type="button" className="action-btn action-btn--reject">
                            <XCircle aria-hidden="true" />
                          </button>
                        </>
                      ) : null}
                      {campaign.status !== 'deleted' && campaign.status !== 'suspended' ? (
                        <button aria-label={`Suspend ${campaign.title}`} onClick={() => setDialogState({ action: 'suspend', campaign })} type="button" className="action-btn action-btn--suspend">
                          <ShieldAlert aria-hidden="true" />
                        </button>
                      ) : null}
                      {campaign.status !== 'deleted' ? (
                        <button aria-label={`Delete ${campaign.title}`} onClick={() => setDialogState({ action: 'delete', campaign })} type="button" className="action-btn action-btn--delete">
                          <Trash2 aria-hidden="true" />
                        </button>
                      ) : null}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {dialogState ? (
        <AdminCampaignActionDialog
          action={dialogState.action}
          campaign={dialogState.campaign}
          isOpen={Boolean(dialogState)}
          onClose={() => setDialogState(null)}
        />
      ) : null}
    </section>
  )
}

export default AdminCampaignPage
