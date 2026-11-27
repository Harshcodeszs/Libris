import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Clock,
  Mail,
  MailCheck,
  Phone,
  ReceiptText,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useAuth, ROLE_HOME } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { allAccountEmails, getDB } from '../../lib/db'
import { registerStudent, resendRegistration } from '../../lib/auth'
import { passwordStrength, validateRegistration } from '../../lib/validation'
import { cn } from '../../lib/format'
import Brand from '../../components/layout/Brand'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false,
}

const benefits = [
  {
    icon: MailCheck,
    title: 'Gmail-confirmed accounts',
    body: 'Your account only activates after you open the confirmation link.',
  },
  {
    icon: BookMarked,
    title: 'Five books at a time',
    body: 'Borrow within your limit and track every due date from one place.',
  },
  {
    icon: Clock,
    title: '14-day loans',
    body: 'Clear due dates and an overdue estimate before you return a book.',
  },
  {
    icon: ReceiptText,
    title: 'Transparent fines',
    body: 'See exactly what you owe, why, and when it was paid.',
  },
]

export default function Register() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const takenEmails = useMemo(() => {
    const emails = allAccountEmails()
    getDB().pending_registrations.forEach((item) => emails.add(item.email))
    return emails
  }, [])

  useEffect(() => {
    if (!user) return
    navigate(user.mustChangePassword ? '/change-password' : ROLE_HOME[user.role], {
      replace: true,
    })
  }, [user, navigate])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
    if (formError) setFormError('')
  }
//  Create operation Student 
  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')
    const result = validateRegistration(values, takenEmails)
    setErrors(result.errors)
    if (!result.valid) {
      setFormError('Please fix the highlighted fields before continuing.')
      return
    }
    setSubmitting(true)
    try {
      const record = registerStudent(values)
      setPending(record)
      setCooldown(30)
      notify('Confirmation email sent. Open the link to activate your account.', 'info')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = () => {
    try {
      const next = resendRegistration(pending.email, pending.token)
      setPending(next)
      setCooldown(30)
      notify('A new confirmation email has been sent.', 'info')
    } catch (error) {
      notify(error.message, 'error')
      setPending(null)
      setCooldown(0)
    }
  }

  const startOver = () => {
    setPending(null)
    setCooldown(0)
    setFormError('')
    setErrors({})
    setValues((current) => ({
      ...current,
      password: '',
      confirmPassword: '',
      agreedToTerms: false,
    }))
  }

  const strength = passwordStrength(values.password)

  if (pending) {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-2xl animate-slide-up">
          <div className="card overflow-hidden">
            <div className="border-b border-cream-200 bg-cream-50 px-6 py-6 sm:px-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-800 text-cream-50 shadow-sm">
                <MailCheck size={22} aria-hidden="true" />
              </span>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
                Check your Gmail
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                We sent a confirmation link to{' '}
                <span className="font-medium text-ink">{pending.email}</span>. Your student account
                is created after you open it.
              </p>
            </div>

            <div className="space-y-5 px-6 py-6 sm:px-8">
              <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 ring-1 ring-inset ring-forest-200">
                    <Mail size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">Confirmation email sent</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      Open the link sent to {pending.email} to activate your student account. If it
                      does not arrive within a few minutes, check your spam folder.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleResend}
                      disabled={cooldown > 0}
                      className="mt-3"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend confirmation email'}
                    </Button>
                  </div>
                </div>
              </div>

              <ol className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Open the link', 'It activates your account.'],
                  ['Account created', 'Student ID and 5-book limit assigned.'],
                  ['Sign in', 'Use your Gmail and password.'],
                ].map(([title, body], index) => (
                  <li key={title} className="rounded-xl border border-cream-200 bg-cream-50 p-3.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brass-700">
                      Step {index + 1}
                    </span>
                    <p className="mt-1 text-sm font-medium text-ink">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{body}</p>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button as={Link} to="/login" variant="secondary" className="sm:flex-1">
                  Go to sign in
                </Button>
                <Button variant="ghost" onClick={startOver} className="sm:flex-1">
                  Use a different email
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-ink-faint">
            Already confirmed?{' '}
            <Link
              to="/login"
              className="font-semibold text-forest-700 underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-cream-300 bg-white shadow-lift lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-forest-950 p-9 lg:flex">
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brass-400/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-forest-400/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <Brand dark />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brass-300">
              <ShieldCheck size={11} aria-hidden="true" />
              Student registration
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-cream-50">
              Your library card, minus the paperwork.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-100/65">
              Student accounts are created here. Librarian accounts are issued by the super
              librarian, so there is no staff sign-up form.
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <li key={benefit.title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brass-300 ring-1 ring-inset ring-white/10">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-cream-50">{benefit.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-cream-100/50">
                        {benefit.body}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="relative text-[11px] leading-relaxed text-cream-100/40">
            By registering you agree to the 14-day loan period and ₱5-per-day overdue policy.
          </p>
        </aside>

        <div className="p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-700">
            New student
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Create your account
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Use a <span className="font-medium text-ink">@gmail.com</span> address — we will send a
            confirmation link before the account goes live.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {formError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                {formError}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                icon={User}
                placeholder="Juan"
                autoComplete="given-name"
                value={values.firstName}
                onChange={(event) => update('firstName', event.target.value)}
                error={errors.firstName}
                required
              />
              <Input
                label="Last name"
                placeholder="Dela Cruz"
                autoComplete="family-name"
                value={values.lastName}
                onChange={(event) => update('lastName', event.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              label="Gmail address"
              type="email"
              icon={Mail}
              placeholder="you@gmail.com"
              autoComplete="email"
              hint="Only @gmail.com addresses are accepted. This cannot be changed later."
              value={values.email}
              onChange={(event) => update('email', event.target.value)}
              error={errors.email}
              required
            />

            <Input
              label="Contact number"
              type="tel"
              icon={Phone}
              placeholder="09171234567"
              autoComplete="tel"
              hint="11-digit mobile number, used by the library desk."
              value={values.contactNumber}
              onChange={(event) => update('contactNumber', event.target.value)}
              error={errors.contactNumber}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <PasswordInput
                  label="Password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  hint="Include a letter and a number."
                  value={values.password}
                  onChange={(event) => update('password', event.target.value)}
                  error={errors.password}
                  required
                />
                {values.password ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex flex-1 gap-1" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((segment) => (
                        <span
                          key={segment}
                          className={cn(
                            'h-1.5 flex-1 rounded-full transition-colors',
                            segment <= strength.score
                              ? strength.tone === 'danger'
                                ? 'bg-red-400'
                                : strength.tone === 'warning'
                                  ? 'bg-brass-400'
                                  : 'bg-forest-500'
                              : 'bg-cream-200',
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        'text-[11px] font-semibold',
                        strength.tone === 'danger'
                          ? 'text-red-600'
                          : strength.tone === 'warning'
                            ? 'text-brass-700'
                            : 'text-forest-700',
                      )}
                    >
                      {strength.label}
                    </span>
                  </div>
                ) : null}
              </div>

              <PasswordInput
                label="Confirm password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(event) => update('confirmPassword', event.target.value)}
                error={errors.confirmPassword}
                required
              />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded border-cream-400 accent-forest-700"
                  checked={values.agreedToTerms}
                  onChange={(event) => update('agreedToTerms', event.target.checked)}
                />
                <span>
                  I understand the 14-day loan period and that overdue books are fined ₱5 per day.
                </span>
              </label>
              {errors.agreedToTerms ? (
                <p className="error-text">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {errors.agreedToTerms}
                </p>
              ) : null}
            </div>

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Create account and send link
              <ArrowRight size={16} />
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-faint">
              <CheckCircle2 size={13} className="text-forest-500" aria-hidden="true" />
              Nothing is created until you confirm the link.
            </p>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-cream-200" />
            <span className="text-xs text-ink-faint">Already registered?</span>
            <span className="h-px flex-1 bg-cream-200" />
          </div>

          <Button as={Link} to="/login" variant="secondary" size="lg" className="w-full">
            Sign in instead
          </Button>
        </div>
      </div>
    </div>
  )
}
