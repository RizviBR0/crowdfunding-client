import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Banknote, CheckCircle2, RefreshCw, WalletCards } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { getApiErrorMessage } from '../lib/api.js'
import { createWithdrawal, getCreatorEarnings, getCreatorWithdrawals } from '../services/withdrawalService.js'

const MIN_WITHDRAWAL_CREDITS = 200

const emptyForm = {
  credits: '',
  paymentSystem: 'Stripe',
  accountNumber: '',
}

const createIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() ??
  `withdrawal-${Date.now()}-${Math.random().toString(36).slice(2)}`

const formatCredits = (value) => `${Number(value ?? 0).toLocaleString()} credits`

const formatDollars = (cents) => `$${(Number(cents ?? 0) / 100).toFixed(2)}`

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
    : 'Not set'

const validateForm = (form, earnings) => {
  const errors = {}
  const credits = Number(form.credits)
  const withdrawable = Number(earnings?.withdrawable ?? 0)

  if (!form.credits || !Number.isInteger(credits) || credits < MIN_WITHDRAWAL_CREDITS) {
    errors.credits = `Enter at least ${MIN_WITHDRAWAL_CREDITS} whole credits.`
  } else if (credits > withdrawable) {
    errors.credits = 'Requested credits cannot exceed your withdrawable balance.'
  }

  if (!form.paymentSystem) {
    errors.paymentSystem = 'Choose a payment system.'
  }

  if (form.accountNumber.trim().length < 3) {
    errors.accountNumber = 'Enter a valid payout account number.'
  }

  return errors
}

const ErrorMessage = ({ children, id }) => (children ? <p className="field-error" id={id}>{children}</p> : null)

function EarningsSummary({ earnings }) {
  const stats = [
    { label: 'Withdrawable credits', value: formatCredits(earnings.withdrawable), icon: WalletCards },
    { label: 'Available payout', value: formatDollars(earnings.withdrawableAmountCents), icon: Banknote },
    { label: 'Lifetime raised', value: formatCredits(earnings.lifetimeRaised), icon: CheckCircle2 },
  ]

  return (
    <div className="withdrawal-stat-grid" aria-label="Creator earnings summary">
      {stats.map(({ icon: Icon, label, value }) => (
        <article className="withdrawal-stat-card" key={label}>
          <span><Icon aria-hidden="true" /></span>
          <strong>{value}</strong>
          <p>{label}</p>
        </article>
      ))}
    </div>
  )
}

function WithdrawalRequestForm({ earnings, onSuccess }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [statusVariant, setStatusVariant] = useState('success')

  const mutation = useMutation({
    mutationFn: () => {
      const nextErrors = validateForm(form, earnings)

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors)
        throw new Error('Review the highlighted withdrawal fields.')
      }

      return createWithdrawal({
        credits: Number(form.credits),
        paymentSystem: form.paymentSystem,
        accountNumber: form.accountNumber.trim(),
        idempotencyKey: createIdempotencyKey(),
      })
    },
    onSuccess: async () => {
      setForm(emptyForm)
      setErrors({})
      setStatusVariant('success')
      setStatusMessage('Withdrawal request submitted for admin review.')
      await onSuccess()
    },
    onError: (error) => {
      setStatusVariant('error')
      setStatusMessage(getApiErrorMessage(error))
    },
  })

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatusMessage('')
  }

  const requestedCredits = Number(form.credits)
  const withdrawable = Number(earnings.withdrawable ?? 0)
  const isInsufficient =
    withdrawable < MIN_WITHDRAWAL_CREDITS ||
    (Number.isInteger(requestedCredits) && requestedCredits > withdrawable)
  const isValidRequest =
    Number.isInteger(requestedCredits) &&
    requestedCredits >= MIN_WITHDRAWAL_CREDITS &&
    requestedCredits <= withdrawable &&
    form.paymentSystem &&
    form.accountNumber.trim().length >= 3

  return (
    <section className="withdrawal-panel" aria-labelledby="withdrawal-request-title">
      <header className="withdrawal-panel__header">
        <div>
          <p className="dashboard-page__eyebrow">Request a payout</p>
          <h2 id="withdrawal-request-title">Move raised credits to your payout account.</h2>
          <p>FundBloom converts every 20 creator credits into one US dollar.</p>
        </div>
        <div className="withdrawal-panel__conversion" aria-label="Withdrawal conversion">
          <strong>20 → $1</strong>
          <span>Creator conversion</span>
        </div>
      </header>

      {statusMessage ? (
        <p aria-live="polite" className={`form-message form-message--${statusVariant}`}>{statusMessage}</p>
      ) : null}

      <form
        aria-label="Withdrawal request form"
        className="withdrawal-form"
        onSubmit={(event) => {
          event.preventDefault()
          setStatusMessage('')
          mutation.mutate()
        }}
      >
        <div className="form-grid">
          <label>
            <span>Credits to withdraw</span>
            <input
              aria-describedby={errors.credits ? 'withdrawal-credits-error' : undefined}
              min={MIN_WITHDRAWAL_CREDITS}
              max={withdrawable || undefined}
              name="credits"
              type="number"
              value={form.credits}
              onChange={(event) => updateField('credits', event.target.value)}
              placeholder="200"
            />
            <ErrorMessage id="withdrawal-credits-error">{errors.credits}</ErrorMessage>
          </label>

          <label>
            <span>Withdrawal amount</span>
            <input
              aria-label="Withdrawal amount"
              readOnly
              value={form.credits && Number.isInteger(requestedCredits) ? formatDollars(requestedCredits * 5) : '$0.00'}
            />
            <small className="field-hint">Calculated automatically from credits.</small>
          </label>

          <label>
            <span>Payment system</span>
            <select
              aria-describedby={errors.paymentSystem ? 'withdrawal-payment-error' : undefined}
              name="paymentSystem"
              value={form.paymentSystem}
              onChange={(event) => updateField('paymentSystem', event.target.value)}
            >
              <option value="Stripe">Stripe</option>
              <option value="Bkash">Bkash</option>
              <option value="Rocket">Rocket</option>
              <option value="Nagad">Nagad</option>
            </select>
            <ErrorMessage id="withdrawal-payment-error">{errors.paymentSystem}</ErrorMessage>
          </label>

          <label>
            <span>Account number</span>
            <input
              aria-describedby={errors.accountNumber ? 'withdrawal-account-error' : undefined}
              name="accountNumber"
              value={form.accountNumber}
              onChange={(event) => updateField('accountNumber', event.target.value)}
              placeholder="Your payout account"
            />
            <ErrorMessage id="withdrawal-account-error">{errors.accountNumber}</ErrorMessage>
          </label>
        </div>

        {isInsufficient ? <p className="withdrawal-insufficient">Insufficient credit</p> : null}
        {!isInsufficient ? (
          <Button disabled={!isValidRequest || mutation.isPending} icon={ArrowRight} iconPosition="right" type="submit">
            {mutation.isPending ? 'Submitting request' : 'Request withdrawal'}
          </Button>
        ) : null}
      </form>
    </section>
  )
}

export function CreatorWithdrawalHistory() {
  const [page, setPage] = useState(1)
  const limit = 10
  const historyQuery = useQuery({
    queryKey: ['creator-withdrawals', page, limit],
    queryFn: () => getCreatorWithdrawals({ page, limit }),
  })
  const withdrawals = historyQuery.data?.withdrawals ?? []
  const meta = historyQuery.data?.meta

  const columns = [
    { key: 'withdrawalCredit', label: 'Credits', render: (row) => formatCredits(row.withdrawalCredit) },
    { key: 'withdrawalAmountCents', label: 'Amount', align: 'right', render: (row) => formatDollars(row.withdrawalAmountCents) },
    { key: 'paymentSystem', label: 'Payment system' },
    { key: 'withdrawDate', label: 'Requested', render: (row) => formatDate(row.withdrawDate) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <span className={`status-chip status-chip--${row.status}`}>{row.status}</span>,
    },
  ]

  return (
    <section className="withdrawal-panel" aria-labelledby="withdrawal-history-title">
      <header className="withdrawal-panel__header">
        <div>
          <p className="dashboard-page__eyebrow">Withdrawal history</p>
          <h2 id="withdrawal-history-title">Every payout request, clearly tracked.</h2>
        </div>
        <Button icon={RefreshCw} isLoading={historyQuery.isFetching} onClick={() => historyQuery.refetch()} variant="secondary">
          Refresh
        </Button>
      </header>

      {historyQuery.isLoading ? <LoadingState label="Loading creator withdrawal history" /> : null}
      {historyQuery.isError ? (
        <EmptyState
          action={<Button icon={RefreshCw} onClick={() => historyQuery.refetch()} variant="secondary">Try again</Button>}
          description={getApiErrorMessage(historyQuery.error)}
          title="Withdrawal history could not load"
        />
      ) : null}
      {!historyQuery.isLoading && !historyQuery.isError && withdrawals.length === 0 ? (
        <EmptyState
          description="Submitted requests will appear here with their current review status."
          title="No withdrawal requests yet"
        />
      ) : null}
      {withdrawals.length > 0 ? <DataTable caption="Creator withdrawal history" columns={columns} rows={withdrawals} /> : null}
      {meta && meta.totalPages > 1 ? (
        <div className="pagination">
          <Button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} variant="secondary">Previous</Button>
          <span className="pagination__info">Page {page} of {meta.totalPages}</span>
          <Button disabled={page === meta.totalPages} onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))} variant="secondary">Next</Button>
        </div>
      ) : null}
    </section>
  )
}

export default function CreatorWithdrawalsPage() {
  const queryClient = useQueryClient()
  const earningsQuery = useQuery({ queryKey: ['creator-earnings'], queryFn: getCreatorEarnings })

  const refreshWithdrawalQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['creator-earnings'] }),
      queryClient.invalidateQueries({ queryKey: ['creator-withdrawals'] }),
    ])
  }

  return (
    <section className="dashboard-page withdrawal-workspace" aria-labelledby="creator-withdrawals-title">
      <div className="dashboard-page__hero withdrawal-workspace__hero">
        <p className="dashboard-page__eyebrow">Creator withdrawals</p>
        <h1 id="creator-withdrawals-title">Turn community momentum into your next milestone.</h1>
        <p>Review your available raised credits, calculate a payout, and send a request to the FundBloom admin team.</p>
      </div>

      {earningsQuery.isLoading ? <LoadingState label="Loading creator earnings" /> : null}
      {earningsQuery.isError ? (
        <EmptyState
          action={<Button icon={RefreshCw} onClick={() => earningsQuery.refetch()} variant="secondary">Try again</Button>}
          description={getApiErrorMessage(earningsQuery.error)}
          title="Creator earnings could not load"
        />
      ) : null}
      {earningsQuery.data ? <EarningsSummary earnings={earningsQuery.data} /> : null}
      {earningsQuery.data ? <WithdrawalRequestForm earnings={earningsQuery.data} onSuccess={refreshWithdrawalQueries} /> : null}
      <CreatorWithdrawalHistory />
    </section>
  )
}

export function CreatorPaymentsPage() {
  return (
    <section className="dashboard-page withdrawal-workspace" aria-labelledby="creator-payments-title">
      <div className="dashboard-page__hero withdrawal-workspace__hero">
        <p className="dashboard-page__eyebrow">Payment history</p>
        <h1 id="creator-payments-title">Keep every payout record within reach.</h1>
        <p>Review pending, approved, and rejected withdrawal requests from your creator account.</p>
      </div>
      <CreatorWithdrawalHistory />
    </section>
  )
}
