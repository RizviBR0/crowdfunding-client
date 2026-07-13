import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, ImagePlus, Sparkles, X } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'
import { getApiErrorMessage } from '../lib/api.js'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'supporter',
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

  if (code.includes('operation-not-allowed')) {
    return 'Email registration is not enabled for this Firebase project yet.'
  }

  if (code.includes('network-request-failed')) {
    return 'Could not reach the authentication service. Check your connection and try again.'
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
  const [photoPreview, setPhotoPreview] = useState(null)

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

  const handlePhotoSelect = (file) => {
    if (file) {
      updateField('photoFile', file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const clearPhoto = () => {
    updateField('photoFile', null)
    setPhotoPreview(null)
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
          photoUrl: '',
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
      console.error('Registration/Login error:', authError)
      const friendlyError = getFriendlyAuthError(authError)
      setError(friendlyError)
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

        <form aria-label={`${mode} form`} className="auth-card__panel auth-form grid gap-4" noValidate onSubmit={handleEmailSubmit}>
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

          {isRegister ? (
            <>
              <label>
                Role
                <select onChange={(event) => updateField('role', event.target.value)} value={form.role}>
                  <option value="supporter">Supporter</option>
                  <option value="creator">Creator</option>
                </select>
              </label>

              <div className="auth-photo-section">
                <span className="auth-photo-label">Profile Picture</span>
                {photoPreview ? (
                  <div className="auth-photo-preview">
                    <img src={photoPreview} alt="Profile preview" />
                    <div className="auth-photo-preview__info">
                      <span className="auth-photo-preview__name">{form.photoFile?.name}</span>
                      <span className="auth-photo-preview__size">
                        {form.photoFile ? `${(form.photoFile.size / 1024).toFixed(1)} KB` : ''}
                      </span>
                    </div>
                    <button
                      aria-label="Remove photo"
                      className="auth-photo-preview__remove"
                      onClick={clearPhoto}
                      type="button"
                    >
                      <X aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <label className="auth-file auth-file--large">
                    <ImagePlus aria-hidden="true" className="auth-file__icon" />
                    <span className="auth-file__text">Click to upload image</span>
                    <span className="auth-file__subtext">JPG, PNG or GIF — max 2 MB</span>
                    <input
                      accept="image/*"
                      onChange={(event) => handlePhotoSelect(event.target.files?.[0] || null)}
                      type="file"
                    />
                  </label>
                )}
              </div>
            </>
          ) : null}

          {error ? <p aria-live="assertive" className="auth-error" role="alert">{error}</p> : null}

          <button className="button button--primary button--medium auth-submit" disabled={isAuthLoading} type="submit">
            <span>{isAuthLoading ? 'Working...' : copy.submit}</span>
            <ArrowRight aria-hidden="true" className="button__icon" />
          </button>

          <button className="auth-google" disabled={isAuthLoading} onClick={handleGoogle} type="button">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
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

