import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Brand from '../components/layout/Brand'
import Button from '../components/ui/Button'

export default function Forbidden() {
  const { user, home } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-cream-100 paper-grain">
      <header className="container-page flex h-16 items-center">
        <Brand />
      </header>
      <main className="container-page flex flex-1 items-center justify-center py-12">
        <div className="card max-w-lg p-8 text-center animate-slide-up">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
            <ShieldAlert size={26} aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brass-700">
            403 · Restricted
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            This area is not yours
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Your account does not have permission to open this page. If you think this is a
            mistake, ask the super librarian to review your account.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {user ? (
              <Button as={Link} to={home}>
                <ArrowLeft size={15} />
                Back to my dashboard
              </Button>
            ) : (
              <Button as={Link} to="/login">
                Sign in
              </Button>
            )}
            <Button as={Link} to="/" variant="secondary">
              Go to the home page
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
