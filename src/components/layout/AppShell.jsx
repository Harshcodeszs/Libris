import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, ShieldCheck, X } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth, ROLE_HOME } from '../../context/AuthContext'
import { NAV } from './navConfig'
import { ROLE_LABEL, ROLE } from '../../lib/constants'
import { cn } from '../../lib/format'
import Brand from './Brand'
import Avatar from '../ui/Avatar'

function SidebarNav({ sections, onNavigate }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Dashboard navigation">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-100/35">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-white/10 text-cream-50'
                          : 'text-cream-100/65 hover:bg-white/5 hover:text-cream-50',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          className={cn(
                            'shrink-0 transition-colors',
                            isActive
                              ? 'text-brass-300'
                              : 'text-cream-100/45 group-hover:text-cream-100/75',
                          )}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.label}</span>
                        {isActive ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-brass-400" aria-hidden="true" />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function UserPanel({ user, onSignOut }) {
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5">
        <Avatar
          firstName={user.firstName}
          lastName={user.lastName}
          role={user.role}
          size="sm"
          className="ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-cream-50">{user.name}</p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-cream-100/45">
            {ROLE_LABEL[user.role]}
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-cream-100/50 transition-colors hover:bg-white/10 hover:text-cream-50"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}

export default function AppShell() {
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  if (!user) return null

  const sections = NAV[user.role] || []
  const home = ROLE_HOME[user.role]
  const handleSignOut = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-forest-950 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Brand dark to={home} />
        </div>
        <SidebarNav sections={sections} />
        <UserPanel user={user} onSignOut={handleSignOut} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-forest-950/50 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-forest-950 shadow-lift animate-slide-in-left">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <Brand dark to={home} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-cream-100/60 transition-colors hover:bg-white/10 hover:text-cream-50"
                aria-label="Close menu"
              >
                <X size={19} />
              </button>
            </div>
            <SidebarNav sections={sections} onNavigate={() => setMobileOpen(false)} />
            <UserPanel user={user} onSignOut={handleSignOut} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-cream-300 bg-cream-100/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-cream-300 bg-white text-ink-soft shadow-sm transition-colors hover:bg-cream-50 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>

          <div className="lg:hidden">
            <Brand compact />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-ink-muted md:block">
              {format(new Date(), 'EEEE, MMMM d')}
            </span>
            <span className="hidden h-5 w-px bg-cream-300 md:block" aria-hidden="true" />
            <div className="flex items-center gap-2 rounded-full border border-cream-300 bg-white py-1 pl-1 pr-2.5 shadow-sm">
              <Avatar
                firstName={user.firstName}
                lastName={user.lastName}
                role={user.role}
                size="sm"
              />
              <div className="hidden leading-tight sm:block">
                <p className="max-w-[11rem] truncate text-xs font-semibold text-ink">{user.name}</p>
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-ink-faint">
                  {user.role === ROLE.SUPER ? <ShieldCheck size={10} /> : null}
                  {ROLE_LABEL[user.role]}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-ink-faint transition-colors hover:bg-cream-200 hover:text-ink"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-cream-200 px-4 py-4 text-xs text-ink-faint sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:flex-row sm:justify-between">
            <span>Libris Library Borrowing System</span>
            <span>Data is stored locally in your browser.</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
