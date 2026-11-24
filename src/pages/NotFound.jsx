import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Brand from '../components/layout/Brand'
import Button from '../components/ui/Button'

export default function NotFound() {
  const { user, home } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-cream-100 paper-grain">
      <header className="container-page flex h-16 items-center">
        <Brand />
      </header>
      <main className="container-page flex flex-1 items-center justify-center py-12">
        <div className="card max-w-lg p-8 text-center animate-slide-up">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-100">
            <Compass size={26} aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brass-700">
            404 · Not found
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            That shelf is empty
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            The page you followed does not exist, or it moved somewhere else in the library.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button as={Link} to={user ? home : '/'}>
              {user ? 'Back to my dashboard' : 'Back to the home page'}
            </Button>
            {!user ? (
              <Button as={Link} to="/login" variant="secondary">
                Sign in
              </Button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
