import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CircleDollarSign,
  Inbox,
  Library,
  Plus,
  ShieldCheck,
  TriangleAlert,
  UserPlus,
  Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getLibrarianWorkload, getOverviewStats } from '../../lib/stats'
import { formatDate, fullName, peso } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'

export default function SuperDashboard() {
  const { user } = useAuth()
  const stats = useMemo(() => getOverviewStats(), [])
  const workload = useMemo(() => getLibrarianWorkload(), [])
  const pendingSetup = workload.filter((item) => item.librarian.must_change_password).length
  const maxLoans = Math.max(...workload.map((item) => item.loans), 1)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={`Administration · ${formatDate(new Date(), 'MMMM d, yyyy')}`}
        title={`${greeting}, ${user.firstName}`}
        description="Manage librarian accounts and keep an eye on how the library is running."
        actions={
          <>
            <Button as={Link} to="/super/librarians" variant="secondary">
              <Users size={16} />
              Manage accounts
            </Button>
            <Button as={Link} to="/super/librarians">
              <UserPlus size={16} />
              Add librarian
            </Button>
          </>
        }
      />

      {pendingSetup > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-brass-200 bg-brass-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brass-700 ring-1 ring-inset ring-brass-200">
              <TriangleAlert size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brass-900">
                {pendingSetup} librarian {pendingSetup === 1 ? 'account is' : 'accounts are'} still
                on an initial password
              </p>
              <p className="text-xs leading-relaxed text-brass-800/80">
                They will be forced to choose a new password at their next sign-in.
              </p>
            </div>
          </div>
          <Button as={Link} to="/super/librarians" variant="secondary" size="sm">
            Review accounts
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Librarian accounts"
          value={stats.librarians}
          hint={pendingSetup ? `${pendingSetup} awaiting password change` : 'All passwords set'}
          icon={ShieldCheck}
          tone="brass"
        />
        <StatCard
          label="Registered students"
          value={stats.students}
          hint="Gmail-confirmed borrowers"
          icon={Users}
        />
        <StatCard
          label="Book copies"
          value={stats.books}
          hint={`${stats.available} available · ${stats.borrowed} on loan`}
          icon={Library}
        />
        <StatCard
          label="Active loans"
          value={stats.activeLoans}
          hint={
            stats.pendingRequests
              ? `${stats.pendingRequests} ${stats.pendingRequests === 1 ? 'request' : 'requests'} pending`
              : `${stats.overdueLoans} overdue right now`
          }
          icon={BookMarked}
          tone={stats.overdueLoans ? 'red' : 'forest'}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-cream-200 px-5 py-4">
            <div>
              <h2 className="section-title">Librarian accounts</h2>
              <p className="mt-0.5 text-xs text-ink-faint">
                Who is on staff and how many loans they have processed.
              </p>
            </div>
            <Link
              to="/super/librarians"
              className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 underline-offset-4 hover:underline"
            >
              Manage
              <ArrowRight size={14} />
            </Link>
          </div>

          {workload.length ? (
            <ul className="divide-y divide-cream-200">
              {workload.map((item) => (
                <li key={item.librarian.librarian_id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar
                    firstName={item.librarian.first_name}
                    lastName={item.librarian.last_name}
                    role="librarian"
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {fullName(item.librarian)}
                    </p>
                    <p className="truncate text-xs text-ink-faint">
                      {item.librarian.librarian_email}
                    </p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-200">
                      <div
                        className="h-full rounded-full bg-brass-500"
                        style={{ width: `${Math.max(4, (item.loans / maxLoans) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-ink">{item.loans} loans</p>
                    <Badge
                      tone={item.librarian.must_change_password ? 'warning' : 'success'}
                      className="mt-1"
                    >
                      {item.librarian.must_change_password ? 'Initial password' : 'Active'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="No librarian accounts"
              description="Add the first librarian so the desk can operate."
              action={
                <Button as={Link} to="/super/librarians" size="sm">
                  <Plus size={15} />
                  Add librarian
                </Button>
              }
            />
          )}

          <div className="border-t border-cream-200 bg-cream-50 px-5 py-3">
            <Link
              to="/super/librarians"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 underline-offset-4 hover:underline"
            >
              <UserPlus size={15} />
              Add or edit librarian accounts
            </Link>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="section-title">Oversight shortcuts</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Librarian operations stay available to you for oversight. Account changes are yours
            alone.
          </p>
          <div className="mt-4 grid gap-2">
            {[
              [
                '/requests',
                Inbox,
                'Borrow requests',
                `${stats.pendingRequests} awaiting approval`,
              ],
              ['/books', Library, 'Catalog', `${stats.books} copies · ${stats.damaged} off the shelf`],
              ['/loans', BookOpen, 'Borrow & return', `${stats.activeLoans} active loans`],
              ['/students', Users, 'Students', `${stats.students} registered borrowers`],
              ['/fines', CircleDollarSign, 'Fines', `${peso(stats.unpaidFinesTotal)} outstanding`],
            ].map(([to, Icon, title, hint]) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-xl border border-cream-200 px-3.5 py-3 transition-colors hover:border-forest-200 hover:bg-cream-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-ink-muted">
                  <Icon size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{title}</p>
                  <p className="text-[11px] text-ink-faint">{hint}</p>
                </div>
                <ArrowRight size={14} className="text-ink-faint" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
