import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, ImagePlus, Sparkles } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'
import { getApiErrorMessage } from '../lib/api.js'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'supporter',
  photoUrl: '',
  photoFile: null,
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getFriendlyAuthError = (error) => {
  const code = error?.code || ''

  if (code.includes('email-already-in-use')) {
    return 'That email already has an account. Try logging in instead.'
  }

  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Email or password is incorrect.'
  }

  if (code.includes('popup-closed-by-user')) {
    return 'Google sign-in was closed before it finished.'
  }

  return getApiErrorMessage(error)
}

const validateForm = ({ form, mode }) => {
  if (mode === 'register' && form.name.trim().length < 2) {
    return 'Enter your full name.'
  }

  if (!emailPattern.test(form.email.trim())) {
    return 'Enter a valid email address.'
  }

  if (mode === 'register') {
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(form.password)

    if (!strongPassword) {
      return 'Use at least 6 characters with uppercase, lowercase, and a number.'
    }
  }

  if (mode === 'login' && !form.password) {
    return 'Enter your password.'
  }

  if (mode === 'register' && !['supporter', 'creator'].includes(form.role)) {
    return 'Choose Supporter or Creator.'
  }

  return ''
}

function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { isAuthLoading, loginWithEmail, loginWithGoogle, registerWithEmail } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const copy = useMemo(
    () =>
      isRegister
        ? {
            eyebrow: 'Start blooming',
            title: 'Create your FundBloom account',
            intro: 'Supporters receive 50 starter credits. Creators receive 20 credits to begin building.',
            submit: 'Create Account',
            switchText: 'Already have an account?',
            switchLabel: 'Login',
            switchHref: '/login',
          }
        : {
            eyebrow: 'Welcome back',
            title: 'Login to FundBloom',
            intro: 'Return to your credits, campaigns, and contribution updates.',
            submit: 'Login',
            switchText: 'New to FundBloom?',
            switchLabel: 'Register',
            switchHref: '/register',
          },
    [isRegister],
  )

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleEmailSubmit = async (event) => {
    event.preventDefault()
    const validationError = validateForm({ form, mode })

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      if (isRegister) {
        await registerWithEmail({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          photoUrl: form.photoUrl.trim(),
          photoFile: form.photoFile,
        })
      } else {
        await loginWithEmail({
          email: form.email.trim(),
          password: form.password,
        })
      }

      navigate('/dashboard')
    } catch (authError) {
      setError(getFriendlyAuthError(authError))
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle({ role: form.role })
      navigate('/dashboard')
    } catch (authError) {
      setError(getFriendlyAuthError(authError))
    }
  }

  return (
    <section className="auth-page" aria-labelledby={`${mode}-title`}>
      <div className="auth-card grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="auth-card__panel auth-card__panel--intro">
          <p className="auth-eyebrow">
            <Sparkles aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 id={`${mode}-title`}>{copy.title}</h1>
          <p>{copy.intro}</p>
          <div className="auth-credit-grid">
            <span>
              <strong>50</strong>
              Supporter credits
            </span>
            <span>
              <strong>20</strong>
              Creator credits
            </span>
          </div>
        </div>

        <form aria-label={`${mode} form`} className="auth-card__panel auth-form grid gap-4" onSubmit={handleEmailSubmit}>
          {isRegister ? (
            <label>
              Name
              <input
                autoComplete="name"
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Asha Bloom"
                type="text"
                value={form.name}
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Password
            <span className="auth-password-field">
              <input
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder={isRegister ? 'Strong password' : 'Your password'}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </span>
          </label>

          <label>
            Role
            <select onChange={(event) => updateField('role', event.target.value)} value={form.role}>
              <option value="supporter">Supporter</option>
              <option value="creator">Creator</option>
            </select>
          </label>

          {isRegister ? (
            <div className="auth-photo-grid">
              <label>
                Profile Picture URL
                <input
                  autoComplete="url"
                  onChange={(event) => updateField('photoUrl', event.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                  value={form.photoUrl}
                />
              </label>
              <label className="auth-file">
                <ImagePlus aria-hidden="true" />
                <span>{form.photoFile ? form.photoFile.name : 'Upload image'}</span>
                <input
                  accept="image/*"
                  onChange={(event) => updateField('photoFile', event.target.files?.[0] || null)}
                  type="file"
                />
              </label>
            </div>
          ) : null}

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="button button--primary button--medium auth-submit" disabled={isAuthLoading} type="submit">
            <span>{isAuthLoading ? 'Working...' : copy.submit}</span>
            <ArrowRight aria-hidden="true" className="button__icon" />
          </button>

          <button className="auth-google" disabled={isAuthLoading} onClick={handleGoogle} type="button">
            Continue with Google as {form.role === 'creator' ? 'Creator' : 'Supporter'}
          </button>

          <p className="auth-switch">
            {copy.switchText} <Link to={copy.switchHref}>{copy.switchLabel}</Link>
          </p>
        </form>
      </div>
    </section>
  )
}

export default AuthPage

