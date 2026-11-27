import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Loader2, MailX, ShieldCheck } from 'lucide-react'
import { confirmStudentRegistration } from '../../lib/studentOperations'
import { fullName } from '../../lib/format'
import Button from '../../components/ui/Button'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const started = useRef(false)
  const [state, setState] = useState({ status: 'verifying', student: null, message: '' })

  // Verification 
  useEffect(() => {
    if (started.current) return
    started.current = true

    if (!token) {
      setState({
        status: 'error',
        student: null,
        message: 'This page needs a confirmation token. Open the confirmation link from your email.',
      })
      return
    }

    try {
      const student = confirmStudentRegistration(token)
      setState({ status: 'success', student, message: '' })
    } catch (error) {
      setState({ status: 'error', student: null, message: error.message })
    }
  }, [token])

  return (
    <div className="container-page py-12 sm:py-20">
      <div className="mx-auto max-w-xl animate-slide-up">
        <div className="card overflow-hidden">
          <div className="border-b border-cream-200 bg-cream-50 px-6 py-8 text-center sm:px-8">
            {state.status === 'verifying' ? (
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-800 text-cream-50 shadow-sm">
                <Loader2 size={24} className="animate-spin" aria-hidden="true" />
              </span>
            ) : state.status === 'success' ? (
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-700 text-cream-50 shadow-sm">
                <CheckCircle2 size={26} aria-hidden="true" />
              </span>
            ) : (
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
                <MailX size={26} aria-hidden="true" />
              </span>
            )}

            <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
              {state.status === 'verifying'
                ? 'Confirming your Gmail…'
                : state.status === 'success'
                  ? 'Email confirmed'
                  : 'Confirmation problem'}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              {state.status === 'verifying'
                ? 'Hang on while we activate your student account.'
                : state.status === 'success'
                  ? 'Your student account is ready. You can sign in with your Gmail and password now.'
                  : state.message}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {state.status === 'success' && state.student ? (
              <div className="space-y-5">
                <div className="rounded-xl border border-forest-200 bg-forest-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-forest-700">
                    Student account
                  </p>
                  <p className="mt-1 text-base font-semibold text-ink">
                    {fullName(state.student)}
                  </p>
                  <p className="text-sm text-ink-muted">{state.student.student_email}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
                    <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-inset ring-forest-200">
                      Student ID #{state.student.student_id}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-inset ring-forest-200">
                      {state.student.max_loan}-book limit
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-inset ring-forest-200">
                      <ShieldCheck size={12} className="text-forest-600" aria-hidden="true" />
                      Gmail verified
                    </span>
                  </div>
                </div>

                <Button as={Link} to="/login" size="lg" className="w-full">
                  Sign in to your dashboard
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : null}

            {state.status === 'error' ? (
              <div className="space-y-3">
                <Button as={Link} to="/register" size="lg" className="w-full">
                  Start a new registration
                </Button>
                <Button as={Link} to="/login" variant="secondary" size="lg" className="w-full">
                  Back to sign in
                </Button>
                <p className="text-center text-xs leading-relaxed text-ink-faint">
                  Confirmation links expire after 24 hours and can only be used once.
                </p>
              </div>
            ) : null}

            {state.status === 'verifying' ? (
              <div className="mx-auto h-1.5 max-w-xs overflow-hidden rounded-full bg-cream-200">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-forest-600" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
