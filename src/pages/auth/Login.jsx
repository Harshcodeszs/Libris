import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Mail, Sparkles } from 'lucide-react'
import { useAuth, ROLE_HOME } from '../../context/AuthContext'
import Brand from '../../components/layout/Brand'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    navigate(user.mustChangePassword ? '/change-password' : ROLE_HOME[user.role], {
      replace: true,
    })
  }, [user, navigate])

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email address and password.')
      return
    }
    setSubmitting(true)
    try {
      signIn(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-cream-300 bg-white shadow-lift lg:grid-cols-[1.02fr_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-forest-950 p-10 lg:flex">
          <div
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brass-400/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-forest-400/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <Brand dark />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brass-300">
              <Sparkles size={11} aria-hidden="true" />
              Welcome back
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-cream-50">
              Good books are waiting.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-100/65">
              One sign-in for students, librarians and supervisors. We read the account type and
              take you straight to the right dashboard.
            </p>
            <blockquote className="mt-8 border-l-2 border-brass-400/70 pl-4 text-sm italic leading-relaxed text-cream-100/60">
              “A library is not a luxury but one of the necessities of life.”
              <footer className="mt-1 text-xs not-italic text-cream-100/40">Henry Ward Beecher</footer>
            </blockquote>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cream-100/45">
              Student access
            </p>
            <p className="mt-1 text-xs leading-relaxed text-cream-100/55">
              Create an account with your Gmail address to request books and track due dates.
            </p>
          </div>
        </aside>

        <div className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-700">
            Sign in
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            One login, every role
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Students sign in with their confirmed Gmail address. Staff use their library email.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
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
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-ink-faint">Sessions stay signed in on this device.</span>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-forest-700 underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Sign in
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-cream-200" />
            <span className="text-xs text-ink-faint">New to the library?</span>
            <span className="h-px flex-1 bg-cream-200" />
          </div>

          <Button as={Link} to="/register" variant="secondary" size="lg" className="w-full">
            Create a student account
          </Button>

          
        </div>
      </div>
    </div>
  )
}
