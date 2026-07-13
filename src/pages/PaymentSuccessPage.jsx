import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ArrowRight, List } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const { refreshUser, user } = useAuth()
  const sessionId = searchParams.get('session_id')
  const [isRefreshing, setIsRefreshing] = useState(!!sessionId)

  useEffect(() => {
    let mounted = true
    const updateCredits = async () => {
      try {
        await refreshUser()
      } finally {
        if (mounted) {
          setIsRefreshing(false)
        }
      }
    }

    if (sessionId) {
      updateCredits()
    }

    return () => {
      mounted = false
    }
  }, [sessionId, refreshUser])

  return (
    <section className="dashboard-page" aria-labelledby="payment-success-title">
      <div className="dashboard-page__hero">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <p className="dashboard-page__eyebrow">Payment successful</p>
        <h1 id="payment-success-title">Thank you for your purchase!</h1>
        <p>
          Your payment was processed successfully.
        </p>
      </div>

      <div className="payment-success-card">
        {isRefreshing ? (
          <p>Verifying your updated credit balance...</p>
        ) : (
          <div>
            <p className="payment-success-card__balance">
              Your new balance is <strong>{user?.credits ?? 0} credits</strong>.
            </p>
            <p className="payment-success-card__description">
              You can now use these credits to back your favorite campaigns on FundBloom.
            </p>
          </div>
        )}
      </div>

      <div className="payment-success-actions">
        <Link to="/dashboard/supporter/explore" className="button button--primary">
          <span>Explore campaigns</span>
          <ArrowRight aria-hidden="true" className="button__icon" />
        </Link>
        <Link to="/dashboard/supporter/payments" className="button button--secondary">
          <List aria-hidden="true" className="button__icon button__icon--left" />
          <span>View payment history</span>
        </Link>
      </div>
    </section>
  )
}
