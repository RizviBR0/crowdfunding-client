import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  Heart,
  Leaf,
  Rocket,
  Search,
  Sparkles,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'
import artistCreator from '../assets/artist-creator.png'
import blobBlue from '../assets/blob-blue.svg'
import childRoboticsLearner from '../assets/child-robotics-learner.png'
import communityGardenTeam from '../assets/community-garden-team.png'
import doodleLoop from '../assets/doodle-loop.svg'
import doodlePaperPlane from '../assets/doodle-paper-plane.svg'
import doodlePurpleBurst from '../assets/doodle-purple-burst.svg'
import ecoTinyHome from '../assets/eco-tiny-home.png'
import educationLaptopKids from '../assets/education-laptop-kids.png'
import mobileClinicSupport from '../assets/mobile-clinic-support.png'
import robotPrototype from '../assets/robot-prototype.png'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { getApiErrorMessage } from '../lib/api.js'
import { createContribution, getPublicCampaign, getPublicCampaigns } from '../services/campaignService.js'
import { createCampaignReport } from '../services/reportService.js'

const categories = ['All', 'Technology', 'Arts & Culture', 'Education', 'Health', 'Community', 'Environment']
const fallbackImages = [
  robotPrototype,
  ecoTinyHome,
  artistCreator,
  mobileClinicSupport,
  communityGardenTeam,
  educationLaptopKids,
]

const formatCredits = (value) => new Intl.NumberFormat('en-US').format(value ?? 0)

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(value))
    : 'Flexible'

const getProgress = (campaign) => {
  if (!campaign?.fundingGoal) return 0

  return Math.min(100, Math.round(((campaign.amountRaised ?? 0) / campaign.fundingGoal) * 100))
}

const getCampaignImage = (campaign, index = 0) => campaign?.coverImageUrl || fallbackImages[index % fallbackImages.length]

const readFilters = (searchParams) => ({
  page: Number(searchParams.get('page') || 1),
  limit: 9,
  search: searchParams.get('search') || '',
  category: searchParams.get('category') || '',
  deadlineFrom: searchParams.get('deadlineFrom') || '',
  deadlineTo: searchParams.get('deadlineTo') || '',
  goalMin: searchParams.get('goalMin') || '',
  goalMax: searchParams.get('goalMax') || '',
})

const createIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `contribution-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function CampaignCard({ campaign, index }) {
  const progress = getProgress(campaign)

  return (
    <article className="explore-card">
      <div className="explore-card__media">
        <img alt="" src={getCampaignImage(campaign, index)} />
        <span>{campaign.category || 'Campaign'}</span>
      </div>
      <div className="explore-card__body">
        <h2>{campaign.title}</h2>
        <p>Created by {campaign.creatorName || 'FundBloom creator'}</p>
        <dl className="explore-card__stats">
          <div>
            <dt>Deadline</dt>
            <dd>{formatDate(campaign.deadline)}</dd>
          </div>
          <div>
            <dt>Goal</dt>
            <dd>{formatCredits(campaign.fundingGoal)}</dd>
          </div>
          <div>
            <dt>Raised</dt>
            <dd>{formatCredits(campaign.amountRaised)}</dd>
          </div>
        </dl>
        <div className="explore-card__progress" aria-label={`${progress}% funded`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <Link className="button button--primary" to={`/campaigns/${campaign.id}`}>
          View Details
          <ArrowRight aria-hidden="true" className="button__icon" />
        </Link>
      </div>
    </article>
  )
}

function ExploreFilters({ filters, setSearchParams }) {
  const applyFilters = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const next = new URLSearchParams()

    ;['search', 'category', 'deadlineFrom', 'deadlineTo', 'goalMin', 'goalMax'].forEach((key) => {
      const value = formData.get(key)?.toString().trim()

      if (value && value !== 'All') {
        next.set(key, value)
      }
    })

    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())

  return (
    <form className="explore-filters" onSubmit={applyFilters}>
      <label>
        <span>Search campaigns</span>
        <input defaultValue={filters.search} name="search" placeholder="Robotics, gardens, health..." />
      </label>
      <label>
        <span>Category</span>
        <select defaultValue={filters.category || 'All'} name="category">
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label>
        <span>From deadline</span>
        <input defaultValue={filters.deadlineFrom} name="deadlineFrom" type="date" />
      </label>
      <label>
        <span>Goal from</span>
        <input defaultValue={filters.goalMin} min="0" name="goalMin" placeholder="1000" type="number" />
      </label>
      <div className="explore-filters__actions">
        <button className="button button--primary" type="submit">
          <Search aria-hidden="true" className="button__icon" />
          Search
        </button>
        <button className="button button--ghost" onClick={clearFilters} type="button">
          Reset
        </button>
      </div>
    </form>
  )
}

function ExplorePage({ surface = 'public' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => readFilters(searchParams), [searchParams])
  const query = useQuery({
    queryKey: ['public-campaigns', filters],
    queryFn: () => getPublicCampaigns(filters),
    staleTime: 60_000,
  })
  const campaigns = query.data?.campaigns ?? []
  const meta = query.data?.meta
  const isDashboard = surface === 'dashboard'

  const movePage = (page) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <section className={`explore-page${isDashboard ? ' explore-page--dashboard' : ''}`} aria-labelledby="explore-title">
      <div className="explore-hero">
        <img alt="" className="explore-doodle explore-doodle--loop" src={doodleLoop} />
        <img alt="" className="explore-doodle explore-doodle--burst" src={doodlePurpleBurst} />
        <div>
          <p className="home-pill">
            <Heart aria-hidden="true" />
            Approved ideas. Real progress.
          </p>
          <h1 id="explore-title">Explore campaigns ready for support</h1>
          <p>
            Browse vetted FundBloom campaigns with active deadlines, clear goals, and creators ready to turn support
            into visible impact.
          </p>
        </div>
        <div className="explore-hero__media" aria-hidden="true">
          <img alt="" src={childRoboticsLearner} />
          <img alt="" src={blobBlue} />
        </div>
      </div>

      <ExploreFilters filters={filters} setSearchParams={setSearchParams} />

      {query.isLoading ? (
        <LoadingState title="Loading campaigns" description="Finding approved projects with active deadlines." />
      ) : query.isError ? (
        <EmptyState
          action={
            <button className="button button--primary" onClick={() => query.refetch()} type="button">
              Try again
            </button>
          }
          description="The campaign list could not be loaded right now."
          title="Campaigns need a refresh"
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          action={
            <button className="button button--primary" onClick={() => setSearchParams(new URLSearchParams())} type="button">
              Clear filters
            </button>
          }
          description="Try a different category, search term, or goal range."
          title="No campaigns match this view"
        />
      ) : (
        <>
          <div className="explore-grid">
            {campaigns.map((campaign, index) => (
              <CampaignCard campaign={campaign} index={index} key={campaign.id} />
            ))}
          </div>
          <div className="explore-pagination" aria-label="Campaign pagination">
            <button
              className="button button--secondary"
              disabled={!meta?.hasPrev}
              onClick={() => movePage((meta?.page ?? 1) - 1)}
              type="button"
            >
              Previous
            </button>
            <span>
              Page {meta?.page ?? 1} of {Math.max(meta?.totalPages ?? 1, 1)}
            </span>
            <button
              className="button button--secondary"
              disabled={!meta?.hasNext}
              onClick={() => movePage((meta?.page ?? 1) + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export function CampaignDetailPage() {
  const { campaignId } = useParams()
  const { isAuthenticated, refreshUser, user } = useAuth()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [successContribution, setSuccessContribution] = useState(null)
  const [reportReason, setReportReason] = useState('')
  const query = useQuery({
    queryKey: ['public-campaign', campaignId],
    queryFn: () => getPublicCampaign(campaignId),
    staleTime: 60_000,
  })
  const campaign = query.data
  const progress = getProgress(campaign)
  const canContribute = isAuthenticated && user?.role === 'supporter'
  const contributionAmount = Number(amount)
  const minimumContribution = campaign?.minimumContribution ?? 1
  const availableCredits = user?.credits ?? 0
  const visibleRemaining = Math.max((campaign?.fundingGoal ?? 0) - (campaign?.amountRaised ?? 0), 0)
  const amountIsInteger = Number.isInteger(contributionAmount)
  const amountIsValid =
    amount !== '' &&
    amountIsInteger &&
    contributionAmount >= minimumContribution &&
    contributionAmount <= availableCredits &&
    visibleRemaining > 0 &&
    contributionAmount <= visibleRemaining
  const contributionMutation = useMutation({
    mutationFn: () =>
      createContribution({
        campaignId,
        amount: contributionAmount,
        message: message.trim(),
        idempotencyKey: createIdempotencyKey(),
      }),
    onSuccess: async (contribution) => {
      setSuccessContribution(contribution)
      setAmount('')
      setMessage('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['public-campaign', campaignId] }),
        queryClient.invalidateQueries({ queryKey: ['public-campaigns'] }),
        refreshUser?.(),
      ])
    },
  })
  const reportMutation = useMutation({
    mutationFn: () => createCampaignReport({ campaignId, reason: reportReason.trim() }),
    onSuccess: () => setReportReason(''),
  })

  const submitContribution = (event) => {
    event.preventDefault()
    setSuccessContribution(null)

    if (!amountIsValid || contributionMutation.isPending) {
      return
    }

    contributionMutation.mutate()
  }

  if (query.isLoading) {
    return (
      <section className="campaign-detail-page">
        <LoadingState title="Loading campaign" description="Opening the latest approved campaign details." />
      </section>
    )
  }

  if (query.isError) {
    return (
      <section className="campaign-detail-page">
        <EmptyState
          action={
            <Link className="button button--primary" to="/explore">
              Back to Explore
            </Link>
          }
          description="This campaign may no longer be active or approved."
          title="Campaign not available"
        />
      </section>
    )
  }

  return (
    <section className="campaign-detail-page" aria-labelledby="campaign-detail-title">
      <Link className="campaign-detail-back" to="/explore">
        <ArrowLeft aria-hidden="true" />
        Back to Explore
      </Link>
      <div className="campaign-detail-hero">
        <div>
          <p className="home-pill">
            <Sparkles aria-hidden="true" />
            {campaign.category || 'Approved campaign'}
          </p>
          <h1 id="campaign-detail-title">{campaign.title}</h1>
          <p>{campaign.story}</p>
          <dl className="campaign-detail-stats">
            <div>
              <ChartNoAxesCombined aria-hidden="true" />
              <span>
                <dt>Raised</dt>
                <dd>{formatCredits(campaign.amountRaised)} credits</dd>
              </span>
            </div>
            <div>
              <WalletCards aria-hidden="true" />
              <span>
                <dt>Funding goal</dt>
                <dd>{formatCredits(campaign.fundingGoal)} credits</dd>
              </span>
            </div>
            <div>
              <CalendarDays aria-hidden="true" />
              <span>
                <dt>Deadline</dt>
                <dd>{formatDate(campaign.deadline)}</dd>
              </span>
            </div>
            <div>
              <UsersRound aria-hidden="true" />
              <span>
                <dt>Creator</dt>
                <dd>{campaign.creatorName}</dd>
              </span>
            </div>
          </dl>
        </div>
        <div className="campaign-detail-media">
          <img alt="" src={getCampaignImage(campaign)} />
          <img alt="" className="campaign-detail-media__doodle" src={doodlePaperPlane} />
        </div>
      </div>

      <div className="campaign-detail-body">
        <article className="campaign-story-panel">
          <p className="home-pill home-pill--flat">
            <Leaf aria-hidden="true" />
            Campaign progress
          </p>
          <h2>Every credit moves this idea forward</h2>
          <div className="explore-card__progress" aria-label={`${progress}% funded`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>
            {progress}% funded toward a {formatCredits(campaign.fundingGoal)} credit goal. Minimum support starts at{' '}
            {formatCredits(campaign.minimumContribution)} credits.
          </p>
          <h3>Reward for supporters</h3>
          <p>{campaign.rewardInfo}</p>
        </article>

        <aside className="contribution-panel" aria-labelledby="contribution-title">
          <p className="home-pill home-pill--flat">
            <Rocket aria-hidden="true" />
            Support this project
          </p>
          <h2 id="contribution-title">Contribution amount</h2>
          {canContribute ? (
            <form onSubmit={submitContribution}>
              <div className="contribution-panel__balance" aria-label="Supporter credit balance">
                <span>Available credits</span>
                <strong>{formatCredits(availableCredits)}</strong>
              </div>
              <label>
                <span>Credits to contribute</span>
                <input
                  min={minimumContribution}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={minimumContribution}
                  step="1"
                  type="number"
                  value={amount}
                />
              </label>
              <label>
                <span>Message to creator</span>
                <textarea
                  maxLength={800}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Share why this campaign matters to you."
                  value={message}
                />
              </label>
              <p className="contribution-panel__hint">
                Minimum {formatCredits(minimumContribution)} credits. Publicly visible remaining room is{' '}
                {formatCredits(visibleRemaining)} credits; the server also accounts for pending reserved support.
              </p>
              {amount !== '' && !amountIsInteger ? (
                <p className="form-message form-message--error">Contribution credits must be a whole number.</p>
              ) : null}
              {amount !== '' && amountIsInteger && contributionAmount < minimumContribution ? (
                <p className="form-message form-message--error">
                  Contribution must be at least {formatCredits(minimumContribution)} credits.
                </p>
              ) : null}
              {amount !== '' && amountIsInteger && contributionAmount > availableCredits ? (
                <p className="form-message form-message--error">
                  Add credits before contributing more than your current balance.
                </p>
              ) : null}
              {amount !== '' && amountIsInteger && visibleRemaining > 0 && contributionAmount > visibleRemaining ? (
                <p className="form-message form-message--error">
                  This amount is above the campaign's visible remaining goal.
                </p>
              ) : null}
              {visibleRemaining <= 0 ? (
                <p className="form-message form-message--error">This campaign has reached its visible funding goal.</p>
              ) : null}
              {contributionMutation.isError ? (
                <p className="form-message form-message--error">{getApiErrorMessage(contributionMutation.error)}</p>
              ) : null}
              {successContribution ? (
                <p className="form-message form-message--success">
                  Your {formatCredits(successContribution.amount)} credit contribution is pending creator review.
                </p>
              ) : null}
              <button className="button button--primary" disabled={!amountIsValid || contributionMutation.isPending} type="submit">
                {contributionMutation.isPending ? 'Sending contribution...' : 'Support This Project'}
              </button>
            </form>
          ) : (
            <div className="contribution-panel__locked">
              <p>Sign in as a Supporter to contribute credits when contributions open.</p>
              <Link className="button button--primary" to="/login">
                Login as Supporter
              </Link>
              <Link className="button button--secondary" to="/register">
                Create Supporter Account
              </Link>
            </div>
          )}
          {user?.role === 'supporter' ? <form className="campaign-report-form" onSubmit={(event) => { event.preventDefault(); if (reportReason.trim().length >= 10) reportMutation.mutate() }}>
            <label><span>Report a concern</span><textarea maxLength={1000} minLength={10} onChange={(event) => setReportReason(event.target.value)} placeholder="Describe a specific safety concern (10+ characters)." value={reportReason} /></label>
            {reportMutation.isError ? <p className="form-message form-message--error">{getApiErrorMessage(reportMutation.error)}</p> : null}
            {reportMutation.isSuccess ? <p className="form-message form-message--success">Thanks. Your report is queued for admin review.</p> : null}
            <button className="button button--ghost" disabled={reportMutation.isPending || reportReason.trim().length < 10} type="submit">{reportMutation.isPending ? 'Sending report...' : 'Submit report'}</button>
          </form> : null}
        </aside>
      </div>
    </section>
  )
}

export default ExplorePage
