import { Link, NavLink, Outlet } from 'react-router-dom'
import { BookMarked, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { BRAND } from '../../lib/constants'
import Brand from './Brand'
import Button from '../ui/Button'

export default function PublicLayout() {
  const { user, home } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <header className="sticky top-0 z-30 border-b border-cream-300/80 bg-cream-100/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Brand />

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
            <Link
              to="/#how-it-works"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-200/60 hover:text-ink md:inline-flex"
            >
              How it works
            </Link>
            <Link
              to="/#for-students"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-200/60 hover:text-ink md:inline-flex"
            >
              For students
            </Link>

            {user ? (
              <Button as={Link} to={home} variant="primary" size="sm" className="ml-1">
                <BookMarked size={15} />
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm" className="ml-1">
                  <LogIn size={15} />
                  Sign in
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  <UserPlus size={15} />
                  <span className="hidden sm:inline">Create account</span>
                  <span className="sm:hidden">Register</span>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-cream-300 bg-cream-50">
        <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Brand compact />
            <span className="hidden text-sm text-ink-faint sm:inline">·</span>
            <p className="text-sm text-ink-faint">{BRAND.library}</p>
          </div>
          <p className="text-xs leading-relaxed text-ink-faint">
            Data is stored locally in this browser. © {new Date().getFullYear()} {BRAND.name}.
          </p>
        </div>
      </footer>
    </div>
  )
}
