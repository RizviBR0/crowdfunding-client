import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, ImageUp, Plus, RefreshCw, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import Modal from '../components/ui/Modal.jsx'
import { getApiErrorMessage } from '../lib/api.js'
import {
  createCampaign,
  deleteCampaign,
  getCreatorCampaigns,
  updateCampaign,
} from '../services/campaignService.js'
import { uploadCampaignImage } from '../services/imageUpload.js'

const categories = ['Technology', 'Arts & Culture', 'Education', 'Health', 'Community', 'Environment']

const emptyCreateForm = {
  title: '',
  story: '',
  category: 'Technology',
  fundingGoal: '',
  minimumContribution: '',
  deadline: '',
  rewardInfo: '',
  imageUrl: '',
  imageFile: null,
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

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const validateCampaignForm = (form) => {
  const errors = {}
  const fundingGoal = Number(form.fundingGoal)
  const minimumContribution = Number(form.minimumContribution)

  if (form.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.'
  }

  if (form.story.trim().length < 20) {
    errors.story = 'Story must be at least 20 characters.'
  }

  if (!form.category) {
    errors.category = 'Choose a campaign category.'
  }

  if (!Number.isInteger(fundingGoal) || fundingGoal <= 0) {
    errors.fundingGoal = 'Funding goal must be a positive whole number.'
  }

  if (!Number.isInteger(minimumContribution) || minimumContribution <= 0) {
    errors.minimumContribution = 'Minimum contribution must be a positive whole number.'
  }

  if (Number.isInteger(fundingGoal) && Number.isInteger(minimumContribution) && minimumContribution > fundingGoal) {
    errors.minimumContribution = 'Minimum contribution cannot exceed the funding goal.'
  }

  if (!form.deadline || new Date(form.deadline).getTime() <= Date.now()) {
    errors.deadline = 'Choose a future deadline.'
  }

  if (form.rewardInfo.trim().length < 2) {
    errors.rewardInfo = 'Reward info is required.'
  }

  if (!form.imageFile && !isHttpsUrl(form.imageUrl.trim())) {
    errors.imageUrl = 'Provide an HTTPS image URL or upload a cover image.'
  }

  return errors
}

const validateUpdateForm = (form) => {
  const errors = {}

  if (form.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.'
  }

  if (form.story.trim().length < 20) {
    errors.story = 'Story must be at least 20 characters.'
  }

  if (form.rewardInfo.trim().length < 2) {
    errors.rewardInfo = 'Reward info is required.'
  }

  return errors
}

const ErrorMessage = ({ children, id }) => (children ? <p className="field-error" id={id}>{children}</p> : null)

function CreatorCampaignForm() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyCreateForm)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const nextErrors = validateCampaignForm(form)

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors)
        throw new Error('Review the highlighted campaign fields.')
      }

      setErrors({})
      const imageUrl = form.imageFile ? await uploadCampaignImage(form.imageFile) : form.imageUrl.trim()

      return createCampaign({
        title: form.title.trim(),
        story: form.story.trim(),
        category: form.category,
        fundingGoal: Number(form.fundingGoal),
        minimumContribution: Number(form.minimumContribution),
        deadline: new Date(form.deadline).toISOString(),
        rewardInfo: form.rewardInfo.trim(),
        imageUrl,
      })
    },
    onSuccess: async () => {
      setForm(emptyCreateForm)
      setStatusMessage('Campaign submitted for admin approval.')
      await queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] })
    },
    onError: (error) => {
      setStatusMessage(getApiErrorMessage(error))
    },
  })

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatusMessage('')
  }

  return (
    <section className="dashboard-page campaign-workspace" aria-labelledby="add-campaign-title">
      <div className="dashboard-page__hero campaign-workspace__hero">
        <p className="dashboard-page__eyebrow">Add new campaign</p>
        <h1 id="add-campaign-title">Launch an idea with clarity.</h1>
        <p>
          Share the project story, funding target, contribution minimum, and cover image. New campaigns stay pending
          until an admin approves them.
        </p>
      </div>

      <form
        aria-label="Add campaign form"
        className="campaign-form"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <div className="form-grid">
          <label>
            <span>Campaign title</span>
            <input
              aria-describedby={errors.title ? 'campaign-title-error' : undefined}
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Build a creative STEM lab"
            />
            <ErrorMessage id="campaign-title-error">{errors.title}</ErrorMessage>
          </label>

          <label>
            <span>Category</span>
            <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Funding goal</span>
            <input
              aria-describedby={errors.fundingGoal ? 'funding-goal-error' : undefined}
              min="1"
              type="number"
              value={form.fundingGoal}
              onChange={(event) => updateField('fundingGoal', event.target.value)}
              placeholder="18000"
            />
            <ErrorMessage id="funding-goal-error">{errors.fundingGoal}</ErrorMessage>
          </label>

          <label>
            <span>Minimum contribution</span>
            <input
              aria-describedby={errors.minimumContribution ? 'minimum-contribution-error' : undefined}
              min="1"
              type="number"
              value={form.minimumContribution}
              onChange={(event) => updateField('minimumContribution', event.target.value)}
              placeholder="25"
            />
            <ErrorMessage id="minimum-contribution-error">{errors.minimumContribution}</ErrorMessage>
          </label>

          <label>
            <span>Deadline</span>
            <input
              aria-describedby={errors.deadline ? 'campaign-deadline-error' : undefined}
              type="date"
              value={form.deadline}
              onChange={(event) => updateField('deadline', event.target.value)}
            />
            <ErrorMessage id="campaign-deadline-error">{errors.deadline}</ErrorMessage>
          </label>

          <label>
            <span>Campaign image URL</span>
            <input
              aria-describedby={errors.imageUrl ? 'campaign-image-url-error' : undefined}
              type="url"
              value={form.imageUrl}
              onChange={(event) => updateField('imageUrl', event.target.value)}
              placeholder="https://example.com/campaign.jpg"
            />
            <ErrorMessage id="campaign-image-url-error">{errors.imageUrl}</ErrorMessage>
          </label>
        </div>

        <label>
          <span>Campaign story</span>
          <textarea
            aria-describedby={errors.story ? 'campaign-story-error' : undefined}
            rows="5"
            value={form.story}
            onChange={(event) => updateField('story', event.target.value)}
            placeholder="Tell supporters what you are building, who it helps, and why now matters."
          />
          <ErrorMessage id="campaign-story-error">{errors.story}</ErrorMessage>
        </label>

        <label>
          <span>Reward info</span>
          <textarea
            aria-describedby={errors.rewardInfo ? 'campaign-reward-error' : undefined}
            rows="3"
            value={form.rewardInfo}
            onChange={(event) => updateField('rewardInfo', event.target.value)}
            placeholder="Mention updates, perks, shoutouts, or community rewards."
          />
          <ErrorMessage id="campaign-reward-error">{errors.rewardInfo}</ErrorMessage>
        </label>

        <label className="campaign-upload">
          <span>
            <ImageUp aria-hidden="true" />
            Upload cover image
          </span>
          <input
            accept="image/*"
            type="file"
            onChange={(event) => updateField('imageFile', event.target.files?.[0] ?? null)}
          />
          {form.imageFile ? <small>{form.imageFile.name}</small> : <small>Optional when an HTTPS URL is provided.</small>}
        </label>

        <div className="campaign-form__actions">
          <Button disabled={mutation.isPending} icon={Plus} type="submit">
            {mutation.isPending ? 'Submitting campaign' : 'Submit for approval'}
          </Button>
          {statusMessage ? <p aria-live="polite">{statusMessage}</p> : null}
        </div>
      </form>
    </section>
  )
}

function UpdateCampaignDialog({ campaign, isOpen, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: campaign.title ?? '',
    story: campaign.story ?? '',
    rewardInfo: campaign.rewardInfo ?? '',
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: () => {
      const nextErrors = validateUpdateForm(form)

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors)
        throw new Error('Review the highlighted campaign fields.')
      }

      return updateCampaign({
        campaignId: campaign.id,
        payload: {
          title: form.title.trim(),
          story: form.story.trim(),
          rewardInfo: form.rewardInfo.trim(),
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] })
      onClose()
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  })

  return (
    <Modal
      description="Only title, story, and reward info can be edited. Status is preserved."
      isOpen={isOpen}
      onClose={onClose}
      title="Update campaign"
    >
      <form
        aria-label="Update campaign form"
        className="campaign-form campaign-form--compact"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <label>
          <span>Campaign title</span>
          <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <ErrorMessage>{errors.title}</ErrorMessage>
        </label>
        <label>
          <span>Campaign story</span>
          <textarea rows="4" value={form.story} onChange={(event) => setForm((current) => ({ ...current, story: event.target.value }))} />
          <ErrorMessage>{errors.story}</ErrorMessage>
        </label>
        <label>
          <span>Reward info</span>
          <textarea rows="3" value={form.rewardInfo} onChange={(event) => setForm((current) => ({ ...current, rewardInfo: event.target.value }))} />
          <ErrorMessage>{errors.rewardInfo}</ErrorMessage>
        </label>
        <div className="campaign-form__actions">
          <Button disabled={mutation.isPending} icon={Edit3} type="submit">
            {mutation.isPending ? 'Saving updates' : 'Save updates'}
          </Button>
          {message ? <p aria-live="polite">{message}</p> : null}
        </div>
      </form>
    </Modal>
  )
}

function DeleteCampaignDialog({ campaign, isOpen, onClose }) {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const mutation = useMutation({
    mutationFn: () => deleteCampaign(campaign.id),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] })
      setMessage(
        `Campaign deleted. Refunded ${result.refund.refundedContributions} contributions worth ${result.refund.refundedCredits} credits.`,
      )
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  })

  return (
    <Modal
      description="Deleting soft-hides the campaign and refunds eligible supporter contributions."
      isOpen={isOpen}
      onClose={() => {
        setMessage('')
        onClose()
      }}
      title="Delete campaign"
    >
      <div className="campaign-delete">
        <p>
          Delete <strong>{campaign?.title}</strong>? Supporters with eligible contributions will be refunded.
        </p>
        <div className="campaign-form__actions">
          <Button disabled={mutation.isPending || Boolean(message)} icon={Trash2} onClick={() => mutation.mutate()} variant="danger">
            {mutation.isPending ? 'Deleting campaign' : 'Delete and refund'}
          </Button>
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </div>
        {message ? <p aria-live="polite">{message}</p> : null}
      </div>
    </Modal>
  )
}

function CreatorCampaignList() {
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [deleteCampaignTarget, setDeleteCampaignTarget] = useState(null)
  const campaignsQuery = useQuery({
    queryKey: ['creator-campaigns', 1],
    queryFn: () => getCreatorCampaigns({ page: 1, limit: 10 }),
  })
  const campaigns = campaignsQuery.data?.campaigns ?? []

  const columns = [
    {
      key: 'title',
      label: 'Campaign',
      render: (campaign) => (
        <span className="campaign-title-cell">
          <strong>{campaign.title}</strong>
          <small>{campaign.category}</small>
        </span>
      ),
    },
    { key: 'deadline', label: 'Deadline', render: (campaign) => formatDate(campaign.deadline) },
    { key: 'fundingGoal', label: 'Goal', render: (campaign) => formatCredits(campaign.fundingGoal), align: 'right' },
    { key: 'amountRaised', label: 'Raised', render: (campaign) => formatCredits(campaign.amountRaised), align: 'right' },
    {
      key: 'status',
      label: 'Status',
      render: (campaign) => <span className={`status-chip status-chip--${campaign.status}`}>{campaign.status}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (campaign) => (
        <span className="campaign-row-actions">
          <button aria-label={`Update ${campaign.title}`} onClick={() => setSelectedCampaign(campaign)} type="button">
            <Edit3 aria-hidden="true" />
          </button>
          <button aria-label={`Delete ${campaign.title}`} onClick={() => setDeleteCampaignTarget(campaign)} type="button">
            <Trash2 aria-hidden="true" />
          </button>
        </span>
      ),
    },
  ]

  return (
    <section className="dashboard-page campaign-workspace" aria-labelledby="creator-campaigns-title">
      <div className="dashboard-page__hero campaign-workspace__hero">
        <p className="dashboard-page__eyebrow">My campaigns</p>
        <h1 id="creator-campaigns-title">Manage your campaign pipeline.</h1>
        <p>Review owner-only campaigns, edit supporter-facing story details, and delete projects with refund protection.</p>
        <Link className="button button--primary" to="/dashboard/creator/campaigns/new">
          <span>Add new campaign</span>
        </Link>
      </div>

      {campaignsQuery.isLoading ? <LoadingState label="Loading creator campaigns" /> : null}
      {campaignsQuery.isError ? (
        <EmptyState
          action={<Button icon={RefreshCw} onClick={() => campaignsQuery.refetch()} variant="secondary">Try again</Button>}
          title="Campaigns could not load"
          description={getApiErrorMessage(campaignsQuery.error)}
        />
      ) : null}
      {!campaignsQuery.isLoading && !campaignsQuery.isError && campaigns.length === 0 ? (
        <EmptyState
          action={<Link className="button button--primary" to="/dashboard/creator/campaigns/new">Add campaign</Link>}
          title="No campaigns yet"
          description="Create your first pending campaign and it will appear here for updates."
        />
      ) : null}
      {campaigns.length > 0 ? (
        <DataTable caption="Creator campaigns sorted by deadline" columns={columns} rows={campaigns} />
      ) : null}

      {selectedCampaign ? (
        <UpdateCampaignDialog
          campaign={selectedCampaign}
          isOpen={Boolean(selectedCampaign)}
          onClose={() => setSelectedCampaign(null)}
        />
      ) : null}
      {deleteCampaignTarget ? (
        <DeleteCampaignDialog
          campaign={deleteCampaignTarget}
          isOpen={Boolean(deleteCampaignTarget)}
          onClose={() => setDeleteCampaignTarget(null)}
        />
      ) : null}
    </section>
  )
}

function CreatorCampaignPage({ mode }) {
  return mode === 'new' ? <CreatorCampaignForm /> : <CreatorCampaignList />
}

export default CreatorCampaignPage
