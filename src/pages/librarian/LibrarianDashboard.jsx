import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Inbox,
  Library,
  Plus,
  ReceiptText,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getOverdueLoans, getOverviewStats } from '../../lib/stats'
import { formatDate, peso } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

const activityIcon = {
  borrow: { icon: BookOpen, className: 'bg-forest-50 text-forest-700' },
  return: { icon: CheckCircle2, className: 'bg-cream-100 text-ink-muted' },
  fine: { icon: ReceiptText, className: 'bg-brass-50 text-brass-700' },
}

export default function LibrarianDashboard() {
  const { user } = useAuth()
  const stats = useMemo(() => getOverviewStats(), [])
  const overdue = useMemo(() => getOverdueLoans().slice(0, 5), [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={formatDate(new Date(), 'EEEE, MMMM d')}
        title={`${greeting}, ${user.firstName}`}
        description="The desk at a glance: circulation, overdue loans and outstanding fines."
        actions={
          <>
            <Button as={Link} to="/books" variant="secondary">
              <Plus size={16} />
              Add a book
            </Button>
            <Button as={Link} to="/loans">
              <BookOpen size={16} />
              Issue a loan
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Catalog"
          value={stats.books}
          hint={`${stats.available} available · ${stats.damaged} off the shelf`}
          icon={Library}
        />
        <StatCard
          label="Active loans"
          value={stats.activeLoans}
          hint={
            stats.pendingRequests
              ? `${stats.pendingRequests} ${stats.pendingRequests === 1 ? 'request' : 'requests'} pending`
              : `${stats.returnedTotal} returns recorded`
          }
          icon={BookMarked}
          tone="brass"
        />
        <StatCard
          label="Overdue"
          value={stats.overdueLoans}
          hint="Needs a follow-up at the desk"
          icon={Clock}
          tone={stats.overdueLoans ? 'red' : 'cream'}
        />
        <StatCard
          label="Unpaid fines"
          value={peso(stats.unpaidFinesTotal)}
          hint={`${stats.unpaidFinesCount} open charges`}
          icon={CircleDollarSign}
          tone={stats.unpaidFinesTotal ? 'red' : 'forest'}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-cream-200 px-5 py-4">
            <div>
              <h2 className="section-title">Overdue shelf</h2>
              <p className="mt-0.5 text-xs text-ink-faint">
                {stats.overdueLoans} active {stats.overdueLoans === 1 ? 'loan is' : 'loans are'}{' '}
                past due.
              </p>
            </div>
            <Link
              to="/loans"
              className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 underline-offset-4 hover:underline"
            >
              Manage
              <ArrowRight size={14} />
            </Link>
          </div>

          {overdue.length ? (
            <ul className="divide-y divide-cream-200">
              {overdue.map((item) => (
                <li key={item.borrow_id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Clock size={16} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.book?.title || 'Removed title'}
                    </p>
                    <p className="truncate text-xs text-ink-faint">
                      {item.student?.first_name} {item.student?.last_name} · due{' '}
                      {formatDate(item.due_date, 'MMM d')}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-red-600">{item.lateDays} days late</p>
                    <p className="text-[11px] text-ink-faint">
                      {peso(item.lateDays * 5)} estimated
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Everything is on schedule"
              description="No active loan is past its due date."
            />
          )}
        </section>

        <div className="space-y-3">
          {[
            {
              to: '/requests',
              icon: Inbox,
              title: 'Review borrow requests',
              body: stats.pendingRequests
                ? `${stats.pendingRequests} ${
                    stats.pendingRequests === 1 ? 'request is' : 'requests are'
                  } waiting for approval.`
                : 'No requests waiting right now.',
            },
            {
              to: '/books',
              icon: Library,
              title: 'Maintain the catalog',
              body: `${stats.available} copies ready to lend.`,
            },
            {
              to: '/students',
              icon: Users,
              title: 'Look up a student',
              body: `${stats.students} registered borrowers.`,
            },
            {
              to: '/fines',
              icon: ReceiptText,
              title: 'Collect or waive fines',
              body: `${stats.unpaidFinesCount} open charges worth ${peso(stats.unpaidFinesTotal)}.`,
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.to} to={item.to} className="card card-hover flex cursor-pointer items-start gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-ink-soft ring-1 ring-inset ring-cream-200">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {stats.overdueLoans ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
          <p>
            {stats.overdueLoans} overdue {stats.overdueLoans === 1 ? 'loan is' : 'loans are'}{' '}
            accruing {peso(5)} per day. Send a reminder or process the return from the borrow desk.
          </p>
        </div>
      ) : null}
    </div>
  )
}
