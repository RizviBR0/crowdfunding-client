import { useState } from 'react'
import { CheckCircle2, CreditCard } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import Button from '../components/ui/Button.jsx'
import { createCheckoutSession } from '../services/paymentService.js'
import { getApiErrorMessage } from '../lib/api.js'

const CREDIT_PACKAGES = [
  { id: 'package_100', credits: 100, price: 10, recommended: false },
  { id: 'package_300', credits: 300, price: 25, recommended: true },
  { id: 'package_800', credits: 800, price: 60, recommended: false },
  { id: 'package_1500', credits: 1500, price: 110, recommended: false },
]

export default function SupporterCreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState('package_300')
  const [errorMessage, setErrorMessage] = useState('')

  const checkoutMutation = useMutation({
    mutationFn: (packageId) => createCheckoutSession(packageId),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl)
      } else {
        setErrorMessage('Failed to initialize payment gateway. Please try again.')
      }
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  const handleCheckout = () => {
    setErrorMessage('')
    checkoutMutation.mutate(selectedPackage)
  }

  return (
    <section className="dashboard-page" aria-labelledby="supporter-credits-title">
      <div className="dashboard-page__hero">
        <p className="dashboard-page__eyebrow">Purchase credit</p>
        <h1 id="supporter-credits-title">Fuel more campaigns</h1>
        <p>
          Purchase FundBloom credits to support the campaigns you love. Credits are added directly to your account.
        </p>
      </div>

      {errorMessage ? (
        <div className="form-message form-message--error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="credit-packages-grid">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`credit-package-card ${
              selectedPackage === pkg.id ? 'credit-package-card--selected' : ''
            } ${pkg.recommended ? 'credit-package-card--recommended' : ''}`}
          >
            {pkg.recommended && (
              <span className="credit-package-card__badge">Most Popular</span>
            )}
            <div className="credit-package-card__header">
              <h3>{pkg.credits} Credits</h3>
              <p className="credit-package-card__price">${pkg.price}</p>
            </div>
            <ul className="credit-package-card__features">
              <li>
                <CheckCircle2 aria-hidden="true" className="feature-icon" />
                Never expires
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" className="feature-icon" />
                Support any campaign
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" className="feature-icon" />
                Instant availability
              </li>
            </ul>
            <div className="credit-package-card__action">
              <input
                type="radio"
                id={`pkg-${pkg.id}`}
                name="credit-package"
                value={pkg.id}
                checked={selectedPackage === pkg.id}
                onChange={() => setSelectedPackage(pkg.id)}
                className="sr-only"
              />
              <Button
                variant={selectedPackage === pkg.id ? 'primary' : 'secondary'}
                onClick={() => setSelectedPackage(pkg.id)}
                className="w-full"
              >
                {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="credit-checkout-section">
        <Button
          onClick={handleCheckout}
          isLoading={checkoutMutation.isPending}
          icon={CreditCard}
          size="lg"
        >
          Checkout with Stripe
        </Button>
      </div>
    </section>
  )
}
