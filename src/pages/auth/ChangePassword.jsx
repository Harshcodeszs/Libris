import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { changePassword } from '../../lib/auth'
import { passwordIssues } from '../../lib/validation'
import Brand from '../../components/layout/Brand'
import Button from '../../components/ui/Button'
import PasswordInput from '../../components/ui/PasswordInput'

export default function ChangePassword() {
  const { user, home, refresh, signOut } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user) return null

  const forced = user.mustChangePassword

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    const issues = passwordIssues(newPassword)
    if (issues.length) {
      setError(`New password needs ${issues.join(', ')}.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      changePassword(user.role, user.id, currentPassword, newPassword)
      refresh()
      notify('Password updated. You can continue to your dashboard.', 'success')
      navigate(home, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream-100 paper-grain">
      <header className="border-b border-cream-300 bg-cream-100/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Brand to={home} />
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut size={15} />
            Sign out
          </Button>
        </div>
      </header>

      <main className="container-page py-10 sm:py-16">
        <div className="mx-auto max-w-lg animate-slide-up">
          <div className="card overflow-hidden">
            <div className="border-b border-cream-200 bg-cream-50 px-6 py-7 sm:px-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-cream-50 shadow-sm">
                <KeyRound size={20} aria-hidden="true" />
              </span>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
                {forced ? 'Set your own password' : 'Change password'}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {forced
                  ? 'Your account was created with an initial password. Choose a private one before opening your dashboard.'
                  : 'Enter your current password, then pick a new one.'}
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8">
              {forced ? (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-brass-200 bg-brass-50 px-3.5 py-3 text-sm text-brass-900">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brass-700" aria-hidden="true" />
                  This step is required for newly issued librarian accounts.
                </div>
              ) : null}

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
                  label="Current password"
                  autoComplete="current-password"
                  placeholder={forced ? 'The initial password you were given' : 'Your current password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />

                <PasswordInput
                  label="New password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  hint="Use a letter and a number, and avoid reusing the old password."
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />

                <PasswordInput
                  label="Confirm new password"
                  autoComplete="new-password"
                  placeholder="Repeat the new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />

                <Button type="submit" size="lg" className="w-full" loading={submitting}>
                  Update password
                </Button>
              </form>

              {!forced ? (
                <div className="mt-5 border-t border-cream-200 pt-4">
                  <Link
                    to={home}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 underline-offset-4 hover:underline"
                  >
                    <ArrowLeft size={15} />
                    Back to dashboard
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-ink-faint">
            Signed in as {user.email}
          </p>
        </div>
      </main>
    </div>
  )
}
