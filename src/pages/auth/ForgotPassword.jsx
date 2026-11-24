import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, KeyRound, Mail } from 'lucide-react'
import { requestPasswordReset } from '../../lib/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Brand from '../../components/layout/Brand'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Enter the email address linked to your account.')
      return
    }
    setSubmitting(true)
    try {
      requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-xl animate-slide-up">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-cream-200 bg-cream-50 px-6 py-7 sm:px-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-cream-50 shadow-sm">
              <KeyRound size={20} aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
              {sent ? 'Check your email' : 'Forgot your password?'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {sent
                ? `If an account exists for ${email}, we sent a password reset link. It expires in one hour.`
                : 'Enter the email on your student or staff account and we will send a reset link.'}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {sent ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-forest-200 bg-forest-50 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 ring-1 ring-inset ring-forest-200">
                    <Mail size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">Reset email sent</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      Open the link in the email to choose a new password. If it does not arrive
                      within a few minutes, check your spam folder.
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setSent(false)
                    setEmail('')
                  }}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {error}
                  </div>
                ) : null}

                <Input
                  label="Email address"
                  type="email"
                  icon={Mail}
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) setError('')
                  }}
                  required
                />

                <Button type="submit" size="lg" className="w-full" loading={submitting}>
                  Send reset link
                </Button>
              </form>
            )}

            <div className="mt-6 border-t border-cream-200 pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 underline-offset-4 hover:underline"
              >
                <ArrowLeft size={15} />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-faint">
          For security, we do not confirm whether an email address is registered.
        </p>
      </div>
    </div>
  )
}
