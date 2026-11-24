import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react'
import { resetPassword } from '../../lib/auth'
import { passwordIssues } from '../../lib/validation'
import Button from '../../components/ui/Button'
import PasswordInput from '../../components/ui/PasswordInput'
import Brand from '../../components/layout/Brand'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    const issues = passwordIssues(password)
    if (issues.length) {
      setError(`Password needs ${issues.join(', ')}.`)
      return
    }
    if (password !== confirmPassword) {
      setError('The two passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      resetPassword(token, password)
      setDone(true)
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
            <span
              className={
                done
                  ? 'flex h-11 w-11 items-center justify-center rounded-xl bg-forest-700 text-cream-50 shadow-sm'
                  : 'flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-cream-50 shadow-sm'
              }
            >
              {done ? <CheckCircle2 size={20} aria-hidden="true" /> : <KeyRound size={20} />}
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
              {done ? 'Password updated' : 'Choose a new password'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {done
                ? 'Your password has been changed. Sign in again with the new one.'
                : 'Pick something you have not used before. At least 8 characters with a letter and a number.'}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {!token && !done ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  This reset link is missing its token. Request a new link to continue.
                </div>
                <Button as={Link} to="/forgot-password" className="w-full">
                  Request a new link
                </Button>
              </div>
            ) : done ? (
              <Button as={Link} to="/login" size="lg" className="w-full">
                Sign in
                <ArrowRight size={16} />
              </Button>
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

                <PasswordInput
                  label="New password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  hint="Use a letter and a number."
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <PasswordInput
                  label="Confirm new password"
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />

                <Button type="submit" size="lg" className="w-full" loading={submitting}>
                  Update password
                </Button>
              </form>
            )}

            <div className="mt-6 border-t border-cream-200 pt-4 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-forest-700 underline-offset-4 hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
